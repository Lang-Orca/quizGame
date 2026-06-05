import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {InMemorySessionSync} from '@/sync/InMemorySessionSync';
import {LanSessionSync} from '@/sync/LanSessionSync';
import {HostGameEngine} from '@/services/HostGameEngine';
import type {EngineState} from '@/services/HostGameEngine';
import {seedQuestionnaires} from '@/services/seedQuestionnaires';
import type {SessionSync} from '@/sync/SessionSync';
import type {Equipe} from '@/types/equipe';

export type HostTransport = 'memory' | 'lan';

const PSEUDOS = [
  'Alex',
  'Bea',
  'Chris',
  'Dina',
  'Elio',
  'Fara',
  'Gus',
  'Hana',
  'Ivan',
  'Jade',
  'Kilian',
  'Lena',
  'Marco',
  'Nina',
  'Omar',
  'Paula',
];

interface HostGameContextValue {
  state: EngineState;
  debug: boolean;
  nextMatchNeedsQuestionnaire: boolean;
  coverage: Array<{roundIndex: number; needed: number; available: number}>;
  startError: string | null;
  addFakePlayer: () => void;
  lockAndPrepare: () => void;
  startNextMatch: () => void;
  prepareNextDuelQuestionnaire: () => void;
  prepareAllMissing: () => void;
  nextQuestion: () => void;
  forceReveal: () => void;
  simulateRandomAnswers: () => void;
}

const HostGameContext = createContext<HostGameContextValue | null>(null);

interface ProviderProps {
  children: React.ReactNode;
  transport?: HostTransport;
  sessionName?: string;
}

export function HostGameProvider({
  children,
  transport = 'memory',
  sessionName = 'Salon QuizGame',
}: ProviderProps) {
  const syncRef = useRef<SessionSync | null>(null);
  const engineRef = useRef<HostGameEngine | null>(null);

  if (!syncRef.current) {
    syncRef.current =
      transport === 'lan' ? new LanSessionSync() : new InMemorySessionSync();
  }
  if (!engineRef.current) {
    engineRef.current = new HostGameEngine({
      sync: syncRef.current,
      mode: 'lan',
    });
  }

  const engine = engineRef.current;
  const sync = syncRef.current;
  const debug = transport === 'memory';

  const [state, setState] = useState<EngineState>(engine.getState());
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = engine.subscribe(setState);
    if (engine.getState().phase === 'idle') {
      engine.createSession(sessionName).catch(() => undefined);
    }
    return () => {
      unsubscribe();
      engine.disconnect();
    };
  }, [engine, sessionName]);

  const value = useMemo<HostGameContextValue>(() => {
    const memorySync =
      sync instanceof InMemorySessionSync ? sync : null;
    // prepare*/assign ne notifient pas le moteur : on rafraîchit explicitement.
    const refreshState = () => setState(engine.getState());

    const duelingMembers = (current: EngineState) => {
      const match = current.currentMatch;
      if (!match) {
        return [];
      }
      const find = (id: string): Equipe | undefined =>
        current.equipes.find(e => e.id === id);
      return [
        ...(find(match.equipeAId)?.membres ?? []),
        ...(find(match.equipeBId)?.membres ?? []),
      ];
    };

    return {
      state,
      debug,
      nextMatchNeedsQuestionnaire: engine.nextMatchNeedsQuestionnaire(),
      coverage: engine.questionnaireCoverage(),
      startError,
      addFakePlayer: () => {
        if (!memorySync) {
          return;
        }
        const index = memorySync.getPlayers().length;
        const pseudo =
          PSEUDOS[index % PSEUDOS.length] +
          (index >= PSEUDOS.length ? ` ${index}` : '');
        memorySync.addPlayer(pseudo);
      },
      lockAndPrepare: () => {
        engine.lockSalon();
        const current = engine.getState();
        const partieId = current.partieId;
        const bracket = current.bracket;
        if (!partieId || !bracket) {
          return;
        }
        // Roadmap 2.5 : seul le 1er tour est préparé au verrouillage ; les
        // rounds suivants sont préparés à l'avancement du bracket.
        const seeded = seedQuestionnaires(partieId, bracket.rounds[0].length);
        engine.setRoundQuestionnaires(
          0,
          seeded.map(q => q.id),
        );
        refreshState();
      },
      startNextMatch: () => {
        try {
          engine.startNextMatch();
          setStartError(null);
        } catch (e) {
          setStartError(
            e instanceof Error ? e.message : 'Impossible de démarrer le duel.',
          );
        }
      },
      prepareNextDuelQuestionnaire: () => {
        const match = engine.peekNextMatch();
        const partieId = engine.getState().partieId;
        if (!match || !partieId) {
          return;
        }
        const [seeded] = seedQuestionnaires(partieId, 1);
        engine.assignQuestionnaire(match.id, seeded.id);
        setStartError(null);
        refreshState();
      },
      prepareAllMissing: () => {
        const partieId = engine.getState().partieId;
        const bracket = engine.getState().bracket;
        if (!partieId || !bracket) {
          return;
        }
        engine.questionnaireCoverage().forEach(({roundIndex, needed, available}) => {
          const missing = needed - available;
          if (missing > 0) {
            const seeded = seedQuestionnaires(partieId, missing);
            const existing = bracket.rounds[roundIndex]
              .map(m => m.questionnaireId)
              .filter((id): id is string => Boolean(id));
            engine.setRoundQuestionnaires(roundIndex, [
              ...existing,
              ...seeded.map(q => q.id),
            ]);
          }
        });
        setStartError(null);
        refreshState();
      },
      nextQuestion: () => engine.nextQuestion(),
      forceReveal: () => engine.expireQuestion(),
      simulateRandomAnswers: () => {
        if (!memorySync) {
          return;
        }
        const current = engine.getState();
        const options = current.question?.options;
        if (!options) {
          return;
        }
        duelingMembers(current).forEach(membre => {
          const choix = options[Math.floor(Math.random() * options.length)];
          memorySync.submitAnswerAs(membre.id, choix);
        });
      },
    };
  }, [engine, sync, state, debug, startError]);

  return (
    <HostGameContext.Provider value={value}>
      {children}
    </HostGameContext.Provider>
  );
}

export function useHostGame(): HostGameContextValue {
  const context = useContext(HostGameContext);
  if (!context) {
    throw new Error('useHostGame doit être utilisé dans un HostGameProvider.');
  }
  return context;
}
