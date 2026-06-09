import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {LanSessionSync} from '@/sync/LanSessionSync';
import {ZeroconfService} from '@/sync/lan/ZeroconfService';
import type {DiscoveredSalon} from '@/sync/lan/ZeroconfService';
import type {
  ClassementEntry,
  GameEndPayload,
  QuestionPayload,
  RevealPayload,
} from '@/sync/messages';
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

interface LanClientContextValue {
  state: ClientState;
  salons: DiscoveredSalon[];
  startScan: () => void;
  connect: (host: string, port: number, pseudo: string) => void;
  submitAnswer: (option: string) => void;
}

const initialState: ClientState = {
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

const LanClientContext = createContext<LanClientContextValue | null>(null);

export function LanClientProvider({children}: {children: React.ReactNode}) {
  const syncRef = useRef<LanSessionSync | null>(null);
  const zeroconfRef = useRef<ZeroconfService | null>(null);
  if (!syncRef.current) {
    syncRef.current = new LanSessionSync();
  }
  if (!zeroconfRef.current) {
    zeroconfRef.current = new ZeroconfService();
  }
  const sync = syncRef.current;
  const zeroconf = zeroconfRef.current;

  const [state, setState] = useState<ClientState>(initialState);
  const [salons, setSalons] = useState<DiscoveredSalon[]>([]);

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

    sync.onReveal(payload =>
      patch({duelPhase: 'reveal', lastReveal: payload}),
    );

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
      zeroconf.stopScan();
      sync.disconnect();
    };
  }, [sync, zeroconf]);

  const value = useMemo<LanClientContextValue>(
    () => ({
      state,
      salons,
      startScan: () => {
        setSalons([]);
        zeroconf.startScan(salon => {
          setSalons(prev => {
            if (prev.some(s => s.name === salon.name)) {
              return prev;
            }
            return [...prev, salon];
          });
        });
      },
      connect: (host, port, pseudo) => {
        setState(prev => ({...prev, phase: 'connecting', pseudo, error: null}));
        sync.joinByAddress(host, port, pseudo).catch((e: unknown) => {
          setState(prev => ({
            ...prev,
            phase: 'idle',
            error:
              e instanceof Error
                ? e.message
                : 'Connexion impossible. Vérifiez le réseau WiFi.',
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
    [state, salons, sync, zeroconf],
  );

  return (
    <LanClientContext.Provider value={value}>
      {children}
    </LanClientContext.Provider>
  );
}

export function useLanClient(): LanClientContextValue {
  const context = useContext(LanClientContext);
  if (!context) {
    throw new Error('useLanClient doit être utilisé dans un LanClientProvider.');
  }
  return context;
}
