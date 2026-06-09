import {getAuth, signInAnonymously} from '@react-native-firebase/auth';
import {
  get,
  getDatabase,
  onChildAdded,
  onDisconnect,
  onValue,
  ref,
  remove,
  runTransaction,
  serverTimestamp,
  set,
} from '@react-native-firebase/database';

import {genererCode6} from '@/domain/code';
import type {Bracket} from '@/types/bracket';
import type {Equipe} from '@/types/equipe';
import type {Joueur} from '@/types/joueur';
import type {RevealPayload} from '@/types/repository';

import type {
  DuelEndPayload,
  GameEndPayload,
  LockSalonPayload,
  QuestionPayload,
  RoundAdvancePayload,
  WsMessageType,
} from './messages';
import type {SessionSync} from './SessionSync';

type Role = 'idle' | 'host' | 'client';

interface EventEnvelope {
  type: WsMessageType;
  payload: unknown;
  seq: number;
}

/**
 * Adaptateur online du transport (Firebase Realtime Database + auth anonyme).
 *
 * Schéma RTDB :
 *   sessions/{code}/meta            { nom, hostUid, createdAt }
 *   sessions/{code}/joueurs/{uid}   { id, pseudo, connected }
 *   sessions/{code}/events/last     { type, payload, seq }   (hôte → clients)
 *   sessions/{code}/reponses/{duelId}/{index}/{uid} = option (clients → hôte)
 *
 * Anti-triche : `reponse_correcte` n'est JAMAIS écrite sous /sessions.
 */
export class FirebaseSessionSync implements SessionSync {
  private readonly db = getDatabase();
  private role: Role = 'idle';
  private sessionId = '';
  private localPlayerId: string | null = null;
  private seq = 0;
  private lastSeqSeen = 0;

  private currentDuelId: string | null = null;
  private currentIndex = 0;
  private answerUnsub: (() => void) | null = null;
  private readonly subscriptions: Array<() => void> = [];

  private playerListListeners: Array<(players: Joueur[]) => void> = [];
  private answerListeners: Array<(playerId: string, option: string) => void> =
    [];
  private lockListeners: Array<(payload: LockSalonPayload) => void> = [];
  private questionListeners: Array<(payload: QuestionPayload) => void> = [];
  private revealListeners: Array<(payload: RevealPayload) => void> = [];
  private duelEndListeners: Array<(payload: DuelEndPayload) => void> = [];
  private roundAdvanceListeners: Array<(payload: RoundAdvancePayload) => void> =
    [];
  private gameEndListeners: Array<(payload: GameEndPayload) => void> = [];

  // --- Helpers chemins ---

  private path(suffix: string): string {
    return `sessions/${this.sessionId}/${suffix}`;
  }

  // --- Hôte ---

  async createSession(nom: string): Promise<string> {
    this.role = 'host';
    const {user} = await signInAnonymously(getAuth());
    this.localPlayerId = user.uid;

    this.sessionId = await this.reserveUniqueCode(nom, user.uid);

    this.listenPlayers();
    return this.sessionId;
  }

  private async reserveUniqueCode(nom: string, hostUid: string): Promise<string> {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const code = genererCode6();
      const metaRef = ref(this.db, `sessions/${code}/meta`);
      const {committed} = await runTransaction(metaRef, current => {
        if (current) {
          return undefined; // code déjà pris → abort, on réessaie
        }
        return {nom, hostUid, createdAt: serverTimestamp()};
      });
      if (committed) {
        return code;
      }
    }
    throw new Error('Impossible de générer un code de session unique.');
  }

  // --- Client ---

  async joinSession(code: string, pseudo: string): Promise<void> {
    this.role = 'client';
    this.sessionId = code.trim().toUpperCase();

    const {user} = await signInAnonymously(getAuth());
    this.localPlayerId = user.uid;

    const metaRef = ref(this.db, this.path('meta'));
    const metaSnap = await get(metaRef);
    if (!metaSnap.exists()) {
      throw new Error('Aucune session trouvée pour ce code.');
    }

    const joueur: Joueur = {id: user.uid, pseudo, connected: true};
    const joueurRef = ref(this.db, this.path(`joueurs/${user.uid}`));
    await set(joueurRef, joueur);
    onDisconnect(joueurRef).remove();

    this.listenPlayers();
    this.listenEvents();
  }

  private listenPlayers(): void {
    const joueursRef = ref(this.db, this.path('joueurs'));
    const unsub = onValue(joueursRef, snapshot => {
      const players: Joueur[] = [];
      snapshot.forEach(child => {
        const value = child.val() as Joueur | null;
        if (value) {
          players.push(value);
        }
        return undefined;
      });
      this.emit(this.playerListListeners, players);
    });
    this.subscriptions.push(unsub);
  }

  private listenEvents(): void {
    const eventsRef = ref(this.db, this.path('events/last'));
    const unsub = onValue(eventsRef, snapshot => {
      const envelope = snapshot.val() as EventEnvelope | null;
      if (!envelope || envelope.seq <= this.lastSeqSeen) {
        return;
      }
      this.lastSeqSeen = envelope.seq;
      this.dispatchEvent(envelope);
    });
    this.subscriptions.push(unsub);
  }

  private dispatchEvent(envelope: EventEnvelope): void {
    switch (envelope.type) {
      case 'LOCK_SALON':
        this.emit(this.lockListeners, envelope.payload as LockSalonPayload);
        break;
      case 'QUESTION': {
        const payload = envelope.payload as QuestionPayload;
        this.currentDuelId = payload.duelId;
        this.currentIndex = payload.index;
        this.emit(this.questionListeners, payload);
        break;
      }
      case 'REVEAL':
        this.emit(this.revealListeners, envelope.payload as RevealPayload);
        break;
      case 'DUEL_END':
        this.emit(this.duelEndListeners, envelope.payload as DuelEndPayload);
        break;
      case 'ROUND_ADVANCE':
        this.emit(
          this.roundAdvanceListeners,
          envelope.payload as RoundAdvancePayload,
        );
        break;
      case 'GAME_END':
        this.emit(this.gameEndListeners, envelope.payload as GameEndPayload);
        break;
      default:
        break;
    }
  }

  // --- Hôte → clients ---

  private broadcastEvent(type: WsMessageType, payload: unknown): void {
    if (this.role !== 'host') {
      return;
    }
    this.seq += 1;
    const eventsRef = ref(this.db, this.path('events/last'));
    const envelope: EventEnvelope = {type, payload, seq: this.seq};
    set(eventsRef, envelope).catch(() => undefined);
  }

  broadcastLockSalon(equipes: Equipe[], bracket: Bracket): void {
    this.broadcastEvent('LOCK_SALON', {equipes, bracket} as LockSalonPayload);
  }

  broadcastQuestion(payload: QuestionPayload): void {
    this.listenAnswersForQuestion(payload.duelId, payload.index);
    this.broadcastEvent('QUESTION', payload);
  }

  broadcastReveal(payload: RevealPayload): void {
    this.broadcastEvent('REVEAL', payload);
  }

  broadcastDuelEnd(payload: DuelEndPayload): void {
    this.broadcastEvent('DUEL_END', payload);
  }

  broadcastRoundAdvance(bracket: Bracket, prochainDuelId: string | null): void {
    this.broadcastEvent('ROUND_ADVANCE', {
      bracket,
      prochainDuelId,
    } as RoundAdvancePayload);
  }

  broadcastGameEnd(payload: GameEndPayload): void {
    this.broadcastEvent('GAME_END', payload);
  }

  private listenAnswersForQuestion(duelId: string, index: number): void {
    this.answerUnsub?.();
    const answersRef = ref(this.db, this.path(`reponses/${duelId}/${index}`));
    this.answerUnsub = onChildAdded(answersRef, snapshot => {
      const playerId = snapshot.key;
      const option = snapshot.val() as string | null;
      if (playerId && typeof option === 'string') {
        this.emit(this.answerListeners, playerId, option);
      }
    });
  }

  // --- Clients → hôte ---

  submitAnswer(duelId: string, option: string): void {
    if (this.role !== 'client' || !this.localPlayerId) {
      return;
    }
    const answerRef = ref(
      this.db,
      this.path(`reponses/${duelId}/${this.currentIndex}/${this.localPlayerId}`),
    );
    set(answerRef, option).catch(() => undefined);
  }

  // --- Abonnements ---

  onPlayerList(callback: (players: Joueur[]) => void): void {
    this.playerListListeners.push(callback);
  }

  onAnswer(callback: (playerId: string, option: string) => void): void {
    this.answerListeners.push(callback);
  }

  onLockSalon(callback: (payload: LockSalonPayload) => void): void {
    this.lockListeners.push(callback);
  }

  onQuestion(callback: (payload: QuestionPayload) => void): void {
    this.questionListeners.push(callback);
  }

  onReveal(callback: (payload: RevealPayload) => void): void {
    this.revealListeners.push(callback);
  }

  onDuelEnd(callback: (payload: DuelEndPayload) => void): void {
    this.duelEndListeners.push(callback);
  }

  onRoundAdvance(callback: (payload: RoundAdvancePayload) => void): void {
    this.roundAdvanceListeners.push(callback);
  }

  onGameEnd(callback: (payload: GameEndPayload) => void): void {
    this.gameEndListeners.push(callback);
  }

  getLocalPlayerId(): string | null {
    return this.localPlayerId;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  disconnect(): void {
    this.answerUnsub?.();
    this.answerUnsub = null;
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions.length = 0;

    if (this.role === 'client' && this.localPlayerId && this.sessionId) {
      remove(ref(this.db, this.path(`joueurs/${this.localPlayerId}`))).catch(
        () => undefined,
      );
    }
    if (this.role === 'host' && this.sessionId) {
      remove(ref(this.db, `sessions/${this.sessionId}`)).catch(() => undefined);
    }
    this.role = 'idle';
  }

  private emit<A extends unknown[]>(
    listeners: Array<(...args: A) => void>,
    ...args: A
  ): void {
    listeners.forEach(listener => listener(...args));
  }
}
