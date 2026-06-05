import {v4 as uuidv4} from 'uuid';

import {WS_PORT} from '@/constants';
import {genererCode6} from '@/domain/code';
import {parseHostAddress} from '@/utils/network';
import type {Bracket} from '@/types/bracket';
import type {Equipe} from '@/types/equipe';
import type {Joueur} from '@/types/joueur';
import type {RevealPayload} from '@/types/repository';

import {createWsMessage} from './messages';
import type {
  AnswerPayload,
  DuelEndPayload,
  GameEndPayload,
  JoinAckPayload,
  JoinPayload,
  LockSalonPayload,
  PlayerListPayload,
  QuestionPayload,
  RoundAdvancePayload,
  WsMessage,
} from './messages';
import type {SessionSync} from './SessionSync';
import {WsClient} from './lan/WsClient';
import {WsServer} from './lan/WsServer';
import {ZeroconfService} from './lan/ZeroconfService';

type Role = 'idle' | 'host' | 'client';

/**
 * Adaptateur LAN du transport (WebSocket/TCP + Zeroconf).
 * Le même objet joue le rôle hôte (createSession) ou client (joinSession).
 */
export class LanSessionSync implements SessionSync {
  private role: Role = 'idle';
  private sessionId = '';

  private readonly server = new WsServer();
  private readonly client = new WsClient();
  private readonly zeroconf = new ZeroconfService();

  private readonly players: Joueur[] = [];
  private readonly clientToPlayer = new Map<string, string>();
  private localPlayerId: string | null = null;

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

  // --- Hôte ---

  async createSession(nom: string): Promise<string> {
    this.role = 'host';
    this.sessionId = genererCode6();

    this.server.onMessage((clientId, message) =>
      this.handleHostMessage(clientId, message),
    );
    this.server.onDisconnect(clientId => this.handleClientDisconnect(clientId));

    await this.server.start(WS_PORT);

    this.zeroconf.publish(
      `QuizGame-${this.sessionId}`,
      {sessionId: this.sessionId, nom, code: this.sessionId},
      WS_PORT,
    );

    return this.sessionId;
  }

  private handleHostMessage(clientId: string, message: WsMessage): void {
    if (message.type === 'JOIN') {
      const {pseudo} = message.payload as JoinPayload;
      const playerId = uuidv4();
      this.clientToPlayer.set(clientId, playerId);
      this.players.push({id: playerId, pseudo, connected: true});

      this.server.send(
        clientId,
        createWsMessage<JoinAckPayload>(
          'JOIN_ACK',
          {playerId, sessionId: this.sessionId},
          this.sessionId,
        ),
      );
      this.broadcastPlayerList();
      return;
    }

    if (message.type === 'ANSWER') {
      const playerId = this.clientToPlayer.get(clientId);
      const {option} = message.payload as AnswerPayload;
      if (playerId) {
        this.emit(this.answerListeners, playerId, option);
      }
    }
  }

  private handleClientDisconnect(clientId: string): void {
    const playerId = this.clientToPlayer.get(clientId);
    if (!playerId) {
      return;
    }
    this.clientToPlayer.delete(clientId);
    const index = this.players.findIndex(p => p.id === playerId);
    if (index >= 0) {
      this.players.splice(index, 1);
    }
    this.broadcastPlayerList();
  }

  private broadcastPlayerList(): void {
    const snapshot = [...this.players];
    this.server.broadcast(
      createWsMessage<PlayerListPayload>(
        'PLAYER_LIST',
        {joueurs: snapshot},
        this.sessionId,
      ),
    );
    this.emit(this.playerListListeners, snapshot);
  }

  // --- Client ---

  async joinSession(code: string, pseudo: string): Promise<void> {
    const parsed = parseHostAddress(code, WS_PORT);
    if (!parsed) {
      throw new Error('Adresse hôte invalide.');
    }
    await this.joinByAddress(parsed.host, parsed.port, pseudo);
  }

  async joinByAddress(
    host: string,
    port: number,
    pseudo: string,
  ): Promise<void> {
    this.role = 'client';

    this.client.onMessage(message => this.handleClientMessage(message));
    await this.client.connect(host, port);

    this.client.send(
      createWsMessage<JoinPayload>('JOIN', {pseudo}, this.sessionId),
    );
  }

  private handleClientMessage(message: WsMessage): void {
    switch (message.type) {
      case 'JOIN_ACK': {
        const payload = message.payload as JoinAckPayload;
        this.localPlayerId = payload.playerId;
        this.sessionId = payload.sessionId;
        this.client.setSessionId(payload.sessionId);
        break;
      }
      case 'PLAYER_LIST':
        this.emit(
          this.playerListListeners,
          (message.payload as PlayerListPayload).joueurs,
        );
        break;
      case 'LOCK_SALON':
        this.emit(this.lockListeners, message.payload as LockSalonPayload);
        break;
      case 'QUESTION':
        this.emit(this.questionListeners, message.payload as QuestionPayload);
        break;
      case 'REVEAL':
        this.emit(this.revealListeners, message.payload as RevealPayload);
        break;
      case 'DUEL_END':
        this.emit(this.duelEndListeners, message.payload as DuelEndPayload);
        break;
      case 'ROUND_ADVANCE':
        this.emit(
          this.roundAdvanceListeners,
          message.payload as RoundAdvancePayload,
        );
        break;
      case 'GAME_END':
        this.emit(this.gameEndListeners, message.payload as GameEndPayload);
        break;
      default:
        break;
    }
  }

  // --- Hôte → clients ---

  broadcastLockSalon(equipes: Equipe[], bracket: Bracket): void {
    this.server.broadcast(
      createWsMessage<LockSalonPayload>(
        'LOCK_SALON',
        {equipes, bracket},
        this.sessionId,
      ),
    );
  }

  broadcastQuestion(payload: QuestionPayload): void {
    this.server.broadcast(
      createWsMessage('QUESTION', payload, this.sessionId),
    );
  }

  broadcastReveal(payload: RevealPayload): void {
    this.server.broadcast(createWsMessage('REVEAL', payload, this.sessionId));
  }

  broadcastDuelEnd(payload: DuelEndPayload): void {
    this.server.broadcast(createWsMessage('DUEL_END', payload, this.sessionId));
  }

  broadcastRoundAdvance(bracket: Bracket, prochainDuelId: string | null): void {
    this.server.broadcast(
      createWsMessage<RoundAdvancePayload>(
        'ROUND_ADVANCE',
        {bracket, prochainDuelId},
        this.sessionId,
      ),
    );
  }

  broadcastGameEnd(payload: GameEndPayload): void {
    this.server.broadcast(createWsMessage('GAME_END', payload, this.sessionId));
  }

  // --- Clients → hôte ---

  submitAnswer(duelId: string, option: string): void {
    if (this.role !== 'client') {
      return;
    }
    this.client.send(
      createWsMessage<AnswerPayload>(
        'ANSWER',
        {duelId, option},
        this.sessionId,
      ),
    );
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

  disconnect(): void {
    if (this.role === 'host') {
      this.zeroconf.unpublish();
      this.server.stop();
    } else if (this.role === 'client') {
      this.client.disconnect();
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
