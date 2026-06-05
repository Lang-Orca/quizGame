import {v4 as uuidv4} from 'uuid';

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
} from './messages';
import type {SessionSync} from './SessionSync';

/**
 * Implémentation en mémoire (loopback) du transport.
 *
 * Utilisée pour les tests du HostGameEngine et le parcours hôte solo (S3) :
 * les broadcasts hôte sont immédiatement renvoyés aux abonnés `on*`, et les
 * joueurs fictifs sont injectés via `addPlayer` / `submitAnswerAs`.
 */
export class InMemorySessionSync implements SessionSync {
  private sessionId = '';
  private players: Joueur[] = [];

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

  async createSession(_nom: string): Promise<string> {
    this.sessionId = genererCode6();
    return this.sessionId;
  }

  async joinSession(code: string, pseudo: string): Promise<void> {
    this.sessionId = code;
    this.addPlayer(pseudo);
  }

  onPlayerList(callback: (players: Joueur[]) => void): void {
    this.playerListListeners.push(callback);
  }

  broadcastLockSalon(equipes: Equipe[], bracket: Bracket): void {
    this.emit(this.lockListeners, {equipes, bracket});
  }

  broadcastQuestion(payload: QuestionPayload): void {
    this.emit(this.questionListeners, payload);
  }

  broadcastReveal(payload: RevealPayload): void {
    this.emit(this.revealListeners, payload);
  }

  broadcastDuelEnd(payload: DuelEndPayload): void {
    this.emit(this.duelEndListeners, payload);
  }

  broadcastRoundAdvance(bracket: Bracket, prochainDuelId: string | null): void {
    this.emit(this.roundAdvanceListeners, {bracket, prochainDuelId});
  }

  broadcastGameEnd(payload: GameEndPayload): void {
    this.emit(this.gameEndListeners, payload);
  }

  submitAnswer(_duelId: string, option: string): void {
    const localPlayer = this.players[0];
    if (localPlayer) {
      this.emit(this.answerListeners, localPlayer.id, option);
    }
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

  disconnect(): void {
    this.playerListListeners = [];
    this.answerListeners = [];
    this.lockListeners = [];
    this.questionListeners = [];
    this.revealListeners = [];
    this.duelEndListeners = [];
    this.roundAdvanceListeners = [];
    this.gameEndListeners = [];
    this.players = [];
  }

  // --- Helpers de test / debug ---

  addPlayer(pseudo: string): Joueur {
    const joueur: Joueur = {
      id: uuidv4(),
      pseudo,
      connected: true,
    };
    this.players.push(joueur);
    this.emit(this.playerListListeners, [...this.players]);
    return joueur;
  }

  removePlayer(playerId: string): void {
    this.players = this.players.filter(p => p.id !== playerId);
    this.emit(this.playerListListeners, [...this.players]);
  }

  submitAnswerAs(playerId: string, option: string): void {
    this.emit(this.answerListeners, playerId, option);
  }

  getPlayers(): Joueur[] {
    return [...this.players];
  }

  private emit<A extends unknown[]>(
    listeners: Array<(...args: A) => void>,
    ...args: A
  ): void {
    listeners.forEach(listener => listener(...args));
  }
}
