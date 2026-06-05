import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  ClassementEntry,
  GameEndPayload,
  QuestionPayload,
  RevealPayload,
} from '@/sync/messages';
import type {SessionSync} from '@/sync/SessionSync';
import type {Bracket} from '@/types/bracket';
import type {Equipe} from '@/types/equipe';
import type {Joueur} from '@/types/joueur';

export type ClientPhase =
  | 'idle'
  | 'connecting'
  | 'lobby'
  | 'tournament'
  | 'duel'
  | 'finished';

export interface ClientState {
  phase: ClientPhase;
  pseudo: string;
  players: Joueur[];
  equipes: Equipe[];
  bracket: Bracket | null;
  myTeamId: string | null;
  question: QuestionPayload | null;
  duelPhase: 'question' | 'reveal' | null;
  selectedOption: string | null;
  lastReveal: RevealPayload | null;
  vainqueurEquipeId: string | null;
  classement: ClassementEntry[];
  error: string | null;
}

export const initialClientState: ClientState = {
  phase: 'idle',
  pseudo: '',
  players: [],
  equipes: [],
  bracket: null,
  myTeamId: null,
  question: null,
  duelPhase: null,
  selectedOption: null,
  lastReveal: null,
  vainqueurEquipeId: null,
  classement: [],
  error: null,
};

/** Transport client : un SessionSync exposant l'id de joueur local. */
export type ClientSync = SessionSync & {getLocalPlayerId(): string | null};

export interface ClientContextValue {
  state: ClientState;
  /** Connexion par code (online) ; le code peut aussi encoder host:port (LAN). */
  connect: (code: string, pseudo: string) => void;
  submitAnswer: (option: string) => void;
}

const ClientContext = createContext<ClientContextValue | null>(null);

interface ProviderProps {
  children: React.ReactNode;
  createSync: () => ClientSync;
}

/**
 * Contexte client générique, agnostique du transport. Branche les callbacks
 * `on*` du SessionSync sur un `ClientState` partagé par les écrans joueur
 * (online et LAN-online par code).
 */
export function ClientProvider({children, createSync}: ProviderProps) {
  const syncRef = useRef<ClientSync | null>(null);
  if (!syncRef.current) {
    syncRef.current = createSync();
  }
  const sync = syncRef.current;

  const [state, setState] = useState<ClientState>(initialClientState);

  useEffect(() => {
    const patch = (partial: Partial<ClientState>) =>
      setState(prev => ({...prev, ...partial}));

    sync.onPlayerList(players =>
      setState(prev => ({
        ...prev,
        players,
        phase: prev.phase === 'connecting' ? 'lobby' : prev.phase,
      })),
    );

    sync.onLockSalon(payload => {
      const myId = sync.getLocalPlayerId();
      const myTeam = payload.equipes.find(e =>
        e.membres.some(m => m.id === myId),
      );
      patch({
        phase: 'tournament',
        equipes: payload.equipes,
        bracket: payload.bracket,
        myTeamId: myTeam?.id ?? null,
      });
    });

    sync.onQuestion(payload =>
      patch({
        phase: 'duel',
        question: payload,
        duelPhase: 'question',
        selectedOption: null,
        lastReveal: null,
      }),
    );

    sync.onReveal(payload => patch({duelPhase: 'reveal', lastReveal: payload}));

    sync.onRoundAdvance(payload =>
      patch({phase: 'tournament', bracket: payload.bracket}),
    );

    sync.onGameEnd((payload: GameEndPayload) =>
      patch({
        phase: 'finished',
        vainqueurEquipeId: payload.vainqueurEquipeId,
        classement: payload.classement,
      }),
    );

    return () => {
      sync.disconnect();
    };
  }, [sync]);

  const value = useMemo<ClientContextValue>(
    () => ({
      state,
      connect: (code, pseudo) => {
        setState(prev => ({...prev, phase: 'connecting', pseudo, error: null}));
        sync.joinSession(code, pseudo).catch((e: unknown) => {
          setState(prev => ({
            ...prev,
            phase: 'idle',
            error:
              e instanceof Error
                ? e.message
                : 'Connexion impossible. Vérifiez votre connexion internet.',
          }));
        });
      },
      submitAnswer: option => {
        const duelId = state.question?.duelId;
        if (!duelId) {
          return;
        }
        sync.submitAnswer(duelId, option);
        setState(prev => ({...prev, selectedOption: option}));
      },
    }),
    [state, sync],
  );

  return (
    <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
  );
}

export function useClient(): ClientContextValue {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient doit être utilisé dans un ClientProvider.');
  }
  return context;
}
