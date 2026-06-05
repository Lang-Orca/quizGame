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

/**
 * Abstraction de transport partagée par LanSessionSync (WebSocket/TCP),
 * FirebaseSessionSync (RTDB) et InMemorySessionSync (tests).
 *
 * Le HostGameEngine est agnostique du transport : il appelle uniquement les
 * méthodes `broadcast*` (hôte → clients) et s'abonne via `onAnswer` /
 * `onPlayerList`. Les écrans joueur consomment les callbacks `on*`.
 */
export interface SessionSync {
  // --- Salon ---
  createSession(nom: string): Promise<string>;
  joinSession(code: string, pseudo: string): Promise<void>;
  onPlayerList(callback: (players: Joueur[]) => void): void;

  // --- Jeu (hôte → clients) ---
  broadcastLockSalon(equipes: Equipe[], bracket: Bracket): void;
  broadcastQuestion(payload: QuestionPayload): void;
  broadcastReveal(payload: RevealPayload): void;
  broadcastDuelEnd(payload: DuelEndPayload): void;
  broadcastRoundAdvance(bracket: Bracket, prochainDuelId: string | null): void;
  broadcastGameEnd(payload: GameEndPayload): void;

  // --- Jeu (clients → hôte) ---
  submitAnswer(duelId: string, option: string): void;
  onAnswer(callback: (playerId: string, option: string) => void): void;

  // --- Jeu (abonnements côté client) ---
  onLockSalon(callback: (payload: LockSalonPayload) => void): void;
  onQuestion(callback: (payload: QuestionPayload) => void): void;
  onReveal(callback: (payload: RevealPayload) => void): void;
  onDuelEnd(callback: (payload: DuelEndPayload) => void): void;
  onRoundAdvance(callback: (payload: RoundAdvancePayload) => void): void;
  onGameEnd(callback: (payload: GameEndPayload) => void): void;

  disconnect(): void;
}
