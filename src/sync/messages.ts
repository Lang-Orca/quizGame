import type {Bracket} from '@/types/bracket';
import type {Equipe} from '@/types/equipe';
import type {Joueur} from '@/types/joueur';
import type {QuestionOptions} from '@/types/question';
import type {RevealPayload} from '@/types/repository';

export type WsMessageType =
  | 'JOIN'
  | 'JOIN_ACK'
  | 'PLAYER_LIST'
  | 'LOCK_SALON'
  | 'BRACKET_UPDATE'
  | 'QUESTION'
  | 'ANSWER'
  | 'REVEAL'
  | 'DUEL_END'
  | 'ROUND_ADVANCE'
  | 'GAME_END'
  | 'ERROR'
  | 'PING'
  | 'PONG';

export interface WsMessage<T = unknown> {
  type: WsMessageType;
  payload: T;
  timestamp: number;
  sessionId: string;
}

export interface JoinPayload {
  pseudo: string;
}

export interface JoinAckPayload {
  playerId: string;
  sessionId: string;
}

export interface PlayerListPayload {
  joueurs: Joueur[];
}

export interface LockSalonPayload {
  equipes: Equipe[];
  bracket: Bracket;
}

export interface BracketUpdatePayload {
  bracket: Bracket;
}

export interface QuestionPayload {
  duelId: string;
  index: number;
  texte: string;
  options: QuestionOptions;
  deadline: number;
}

export interface AnswerPayload {
  duelId: string;
  option: string;
}

export interface DuelScoresFinaux {
  equipeAId: string;
  equipeBId: string;
  scoreA: number;
  scoreB: number;
}

export interface DuelEndPayload {
  duelId: string;
  vainqueurId: string | null;
  scoresFinaux: DuelScoresFinaux;
}

export interface RoundAdvancePayload {
  bracket: Bracket;
  prochainDuelId: string | null;
}

export interface ClassementEntry {
  equipeId: string;
  nom: string;
  points: number;
}

export interface GameEndPayload {
  vainqueurEquipeId: string;
  classement: ClassementEntry[];
}

export interface ErrorPayload {
  code: string;
  message: string;
}

export {RevealPayload};

export function createWsMessage<T>(
  type: WsMessageType,
  payload: T,
  sessionId: string,
): WsMessage<T> {
  return {
    type,
    payload,
    timestamp: Date.now(),
    sessionId,
  };
}

export function encodeFrame(message: WsMessage): string {
  return `${JSON.stringify(message)}\n`;
}

/**
 * Décodeur de flux TCP : les messages sont des objets JSON séparés par '\n'.
 * Conserve les fragments partiels entre deux chunks reçus sur la socket.
 */
export class FrameDecoder {
  private buffer = '';

  push(chunk: string): WsMessage[] {
    this.buffer += chunk;
    const parts = this.buffer.split('\n');
    this.buffer = parts.pop() ?? '';

    const messages: WsMessage[] = [];
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) {
        continue;
      }
      try {
        messages.push(JSON.parse(trimmed) as WsMessage);
      } catch {
        // Frame malformée ignorée pour ne pas casser le flux.
      }
    }
    return messages;
  }

  reset(): void {
    this.buffer = '';
  }
}
