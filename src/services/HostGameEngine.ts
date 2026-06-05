import {v4 as uuidv4} from 'uuid';

import {QUESTIONS_PAR_DUEL, TIMER_DEFAULT_SECONDS} from '@/constants';
import {avancerBracket, genererBracket, getMatchsEnAttente} from '@/domain/bracket';
import {calculerVainqueurDuel} from '@/domain/scoring';
import {genererEquipes} from '@/domain/teams';
import {PartieRepository} from '@/data/sqlite/PartieRepository';
import {QuestionnaireRepository} from '@/data/sqlite/QuestionnaireRepository';
import {HostQuestionService} from '@/services/HostQuestionService';
import type {Bracket, Match} from '@/types/bracket';
import type {Equipe} from '@/types/equipe';
import type {Joueur} from '@/types/joueur';
import type {PartieMode} from '@/types/partie';
import type {QuestionOptions} from '@/types/question';
import type {RevealPayload} from '@/types/repository';
import type {ClassementEntry} from '@/sync/messages';
import type {SessionSync} from '@/sync/SessionSync';

export type EnginePhase =
  | 'idle'
  | 'lobby'
  | 'tournament'
  | 'duel'
  | 'finished';

export type DuelPhase = 'question' | 'reveal' | null;

export interface ActiveQuestion {
  index: number;
  texte: string;
  options: QuestionOptions;
}

export interface EngineState {
  phase: EnginePhase;
  duelPhase: DuelPhase;
  partieId: string | null;
  sessionId: string | null;
  players: Joueur[];
  equipes: Equipe[];
  bracket: Bracket | null;
  currentMatch: Match | null;
  question: ActiveQuestion | null;
  deadline: number | null;
  manches: {A: number; B: number};
  lastReveal: RevealPayload | null;
  vainqueurTournoiId: string | null;
  classement: ClassementEntry[];
}

export interface HostGameEngineDeps {
  sync: SessionSync;
  mode?: PartieMode;
  timerSeconds?: number;
  partieRepo?: PartieRepository;
  questionnaireRepo?: QuestionnaireRepository;
  hostQuestionService?: HostQuestionService;
  /** Notifié quand un duel n'a aucun questionnaire assigné (S6). */
  onQuestionnaireNeeded?: (match: Match) => void;
}

export class QuestionnaireNeededError extends Error {
  constructor(public readonly match: Match) {
    super(
      `Aucun questionnaire assigné au duel ${match.id} (round ${
        match.roundIndex + 1
      }). En mode offline, préparez un questionnaire public avant de lancer ce duel.`,
    );
    this.name = 'QuestionnaireNeededError';
  }
}

export class HostGameEngine {
  private readonly sync: SessionSync;
  private readonly mode: PartieMode;
  private readonly timerSeconds: number;
  private readonly partieRepo: PartieRepository;
  private readonly questionnaireRepo: QuestionnaireRepository;
  private readonly hostQuestionService: HostQuestionService;
  private readonly onQuestionnaireNeeded?: (match: Match) => void;

  private state: EngineState = {
    phase: 'idle',
    duelPhase: null,
    partieId: null,
    sessionId: null,
    players: [],
    equipes: [],
    bracket: null,
    currentMatch: null,
    question: null,
    deadline: null,
    manches: {A: 0, B: 0},
    lastReveal: null,
    vainqueurTournoiId: null,
    classement: [],
  };

  private readonly listeners = new Set<(state: EngineState) => void>();
  private readonly assignments: Record<string, string> = {};
  private readonly roundPools: Record<number, string[]> = {};
  private readonly cumulativeScores: Record<string, number> = {};

  private answers = new Map<string, string>();
  private correcteCourante = '';
  private timerHandle: ReturnType<typeof setInterval> | null = null;

  constructor(deps: HostGameEngineDeps) {
    this.sync = deps.sync;
    this.mode = deps.mode ?? 'lan';
    this.timerSeconds = deps.timerSeconds ?? TIMER_DEFAULT_SECONDS;
    this.partieRepo = deps.partieRepo ?? new PartieRepository();
    this.questionnaireRepo =
      deps.questionnaireRepo ?? new QuestionnaireRepository();
    this.hostQuestionService =
      deps.hostQuestionService ?? new HostQuestionService();
    this.onQuestionnaireNeeded = deps.onQuestionnaireNeeded;

    this.sync.onPlayerList(players => this.handlePlayerList(players));
    this.sync.onAnswer((playerId, option) =>
      this.recordAnswer(playerId, option),
    );
  }

  // --- Abonnement UI ---

  getState(): EngineState {
    return this.snapshot();
  }

  subscribe(listener: (state: EngineState) => void): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  // --- Cycle de vie ---

  async createSession(nom: string): Promise<string> {
    const partieId = uuidv4();
    this.partieRepo.createPartie({id: partieId, nom, mode: this.mode});
    const sessionId = await this.sync.createSession(nom);

    this.state.partieId = partieId;
    this.state.sessionId = sessionId;
    this.setPhase('lobby');
    return sessionId;
  }

  setRoundQuestionnaires(roundIndex: number, questionnaireIds: string[]): void {
    this.roundPools[roundIndex] = [...questionnaireIds];
  }

  assignQuestionnaire(matchId: string, questionnaireId: string): void {
    this.assignments[matchId] = questionnaireId;
  }

  lockSalon(): void {
    if (this.state.phase !== 'lobby') {
      throw new Error('Le salon ne peut être verrouillé que depuis le lobby.');
    }

    const equipes = genererEquipes(this.state.players);
    const bracket = genererBracket(equipes.length);

    equipes.forEach(equipe => {
      this.cumulativeScores[equipe.id] = 0;
    });

    this.state.equipes = equipes;
    this.state.bracket = bracket;

    if (this.state.partieId) {
      this.partieRepo.updateStatut(this.state.partieId, 'verrouille');
    }

    this.sync.broadcastLockSalon(equipes, bracket);
    this.setPhase('tournament');
  }

  startNextMatch(): void {
    if (this.state.phase !== 'tournament' || !this.state.bracket) {
      throw new Error('Aucun tournoi en cours.');
    }

    const pending = getMatchsEnAttente(this.state.bracket);
    if (pending.length === 0) {
      throw new Error('Aucun duel disponible à démarrer.');
    }

    const match = pending[0];
    const questionnaireId = this.resolveQuestionnaireId(match);
    if (!questionnaireId) {
      this.onQuestionnaireNeeded?.(match);
      throw new QuestionnaireNeededError(match);
    }

    match.questionnaireId = questionnaireId;
    this.questionnaireRepo.assignToDuel(
      questionnaireId,
      match.id,
      match.roundIndex,
    );

    this.state.currentMatch = match;
    this.state.manches = {A: 0, B: 0};
    this.state.lastReveal = null;

    if (this.state.partieId) {
      this.partieRepo.updateStatut(this.state.partieId, 'duel');
    }

    this.setPhaseSilent('duel');
    this.startQuestion(0);
  }

  /** Hôte : passe à la question suivante après un REVEAL, ou termine le duel. */
  nextQuestion(): void {
    if (this.state.duelPhase !== 'reveal' || !this.state.currentMatch) {
      throw new Error('Aucun reveal en attente.');
    }

    const nextIndex = (this.state.question?.index ?? 0) + 1;
    if (nextIndex < QUESTIONS_PAR_DUEL) {
      this.startQuestion(nextIndex);
      return;
    }

    this.resolveDuel(nextIndex);
  }

  /** Représente l'événement TIMER_EXPIRED (appelé par le timer interne ou en test). */
  expireQuestion(): void {
    if (this.state.duelPhase === 'question') {
      this.resolveQuestion();
    }
  }

  recordAnswer(playerId: string, option: string): void {
    if (this.state.duelPhase !== 'question' || !this.state.currentMatch) {
      return;
    }
    if (!this.isDuelingPlayer(playerId)) {
      return;
    }

    this.answers.set(playerId, option);

    if (this.answers.size >= this.expectedAnswerCount()) {
      this.resolveQuestion();
    }
  }

  disconnect(): void {
    this.clearTimer();
    this.sync.disconnect();
    this.listeners.clear();
  }

  // --- Internes ---

  private handlePlayerList(players: Joueur[]): void {
    this.state.players = players;
    if (this.state.phase === 'idle') {
      this.setPhase('lobby');
      return;
    }
    this.notify();
  }

  private resolveQuestionnaireId(match: Match): string | null {
    if (match.questionnaireId) {
      return match.questionnaireId;
    }
    if (this.assignments[match.id]) {
      return this.assignments[match.id];
    }
    const pool = this.roundPools[match.roundIndex];
    if (pool && pool.length > 0) {
      return pool.shift() ?? null;
    }
    return null;
  }

  /** Variante non-consommante (pour l'UI : sait si un duel peut démarrer). */
  private peekQuestionnaireId(match: Match): string | null {
    if (match.questionnaireId) {
      return match.questionnaireId;
    }
    if (this.assignments[match.id]) {
      return this.assignments[match.id];
    }
    const pool = this.roundPools[match.roundIndex];
    if (pool && pool.length > 0) {
      return pool[0];
    }
    return null;
  }

  peekNextMatch(): Match | null {
    if (!this.state.bracket) {
      return null;
    }
    return getMatchsEnAttente(this.state.bracket)[0] ?? null;
  }

  /** S6 : indique si le prochain duel n'a aucun questionnaire assigné. */
  nextMatchNeedsQuestionnaire(): boolean {
    const match = this.peekNextMatch();
    if (!match) {
      return false;
    }
    return this.peekQuestionnaireId(match) === null;
  }

  /** S6 : couverture des questionnaires par round (pour l'UI hôte). */
  questionnaireCoverage(): Array<{
    roundIndex: number;
    needed: number;
    available: number;
  }> {
    if (!this.state.bracket) {
      return [];
    }
    return this.state.bracket.rounds.map((round, roundIndex) => {
      const poolLen = this.roundPools[roundIndex]?.length ?? 0;
      const assigned = round.filter(
        m => m.questionnaireId || this.assignments[m.id],
      ).length;
      return {
        roundIndex,
        needed: round.length,
        available: Math.min(round.length, poolLen + assigned),
      };
    });
  }

  private startQuestion(index: number): void {
    const match = this.state.currentMatch;
    if (!match || !match.questionnaireId) {
      throw new Error('Aucun duel actif.');
    }

    const question = this.hostQuestionService.getQuestionWithAnswer(
      match.questionnaireId,
      index,
      true,
    );

    this.correcteCourante = question.reponse_correcte;
    this.answers = new Map();
    this.state.question = {
      index,
      texte: question.texte,
      options: question.options,
    };
    this.state.deadline = Date.now() + this.timerSeconds * 1000;
    this.state.duelPhase = 'question';
    this.state.lastReveal = null;

    this.sync.broadcastQuestion({
      duelId: match.id,
      index,
      texte: question.texte,
      options: question.options,
      deadline: this.state.deadline,
    });

    this.startTimer();
    this.notify();
  }

  private resolveQuestion(): void {
    const match = this.state.currentMatch;
    const question = this.state.question;
    if (!match || !question) {
      return;
    }

    this.clearTimer();

    const equipeA = this.findEquipe(match.equipeAId);
    const equipeB = this.findEquipe(match.equipeBId);
    const reponsesA = this.evaluateTeam(equipeA);
    const reponsesB = this.evaluateTeam(equipeB);

    const reveal = this.hostQuestionService.buildRevealPayload({
      duelId: match.id,
      questionIndex: question.index,
      optionCorrecte: this.correcteCourante,
      reponsesA,
      reponsesB,
    });

    if (reveal.mancheGagnante === 'A') {
      this.state.manches.A += 1;
    } else if (reveal.mancheGagnante === 'B') {
      this.state.manches.B += 1;
    }

    this.state.duelPhase = 'reveal';
    this.state.lastReveal = reveal;
    this.sync.broadcastReveal(reveal);
    this.notify();
  }

  private resolveDuel(nextIndex: number): void {
    const match = this.state.currentMatch;
    if (!match) {
      return;
    }

    const equipeA = this.findEquipe(match.equipeAId);
    const equipeB = this.findEquipe(match.equipeBId);

    const result = calculerVainqueurDuel({
      manchesA: this.state.manches.A,
      manchesB: this.state.manches.B,
      bonusA: equipeA?.bonusPoints ?? 0,
      bonusB: equipeB?.bonusPoints ?? 0,
      equipeAId: match.equipeAId,
      equipeBId: match.equipeBId,
    });

    if (result.egalite) {
      const totalQuestions = match.questionnaireId
        ? this.questionnaireRepo.countQuestions(match.questionnaireId)
        : QUESTIONS_PAR_DUEL;

      if (nextIndex < totalQuestions) {
        // Mort subite : on enchaîne sur la question de départage.
        this.startQuestion(nextIndex);
        return;
      }
    }

    const vainqueurId = result.vainqueurId ?? match.equipeAId;
    this.endDuel(match, vainqueurId, result.scoreA, result.scoreB);
  }

  private endDuel(
    match: Match,
    vainqueurId: string,
    scoreA: number,
    scoreB: number,
  ): void {
    this.cumulativeScores[match.equipeAId] =
      (this.cumulativeScores[match.equipeAId] ?? 0) + scoreA;
    this.cumulativeScores[match.equipeBId] =
      (this.cumulativeScores[match.equipeBId] ?? 0) + scoreB;

    const bracket = avancerBracket(this.state.bracket!, match.id, vainqueurId);
    this.state.bracket = bracket;

    this.sync.broadcastDuelEnd({
      duelId: match.id,
      vainqueurId,
      scoresFinaux: {
        equipeAId: match.equipeAId,
        equipeBId: match.equipeBId,
        scoreA,
        scoreB,
      },
    });

    this.state.currentMatch = null;
    this.state.question = null;
    this.state.duelPhase = null;
    this.state.deadline = null;

    const pending = getMatchsEnAttente(bracket);
    if (pending.length === 0) {
      this.finishGame(vainqueurId);
      return;
    }

    if (this.state.partieId) {
      this.partieRepo.updateStatut(this.state.partieId, 'tournoi');
    }
    this.setPhaseSilent('tournament');
    this.sync.broadcastRoundAdvance(bracket, pending[0].id);
    this.notify();
  }

  private finishGame(vainqueurId: string): void {
    if (this.state.partieId) {
      this.partieRepo.setGagnant(this.state.partieId, vainqueurId);
      this.questionnaireRepo.deverrouillerQuestionnaires(this.state.partieId);
    }

    const classement = this.buildClassement(vainqueurId);
    this.state.vainqueurTournoiId = vainqueurId;
    this.state.classement = classement;

    this.sync.broadcastGameEnd({
      vainqueurEquipeId: vainqueurId,
      classement,
    });

    this.setPhase('finished');
  }

  private buildClassement(vainqueurId: string): ClassementEntry[] {
    return this.state.equipes
      .map(equipe => ({
        equipeId: equipe.id,
        nom: equipe.nom,
        points: this.cumulativeScores[equipe.id] ?? 0,
      }))
      .sort((a, b) => {
        if (a.equipeId === vainqueurId) {
          return -1;
        }
        if (b.equipeId === vainqueurId) {
          return 1;
        }
        return b.points - a.points;
      });
  }

  private findEquipe(equipeId: string): Equipe | undefined {
    return this.state.equipes.find(e => e.id === equipeId);
  }

  private evaluateTeam(equipe: Equipe | undefined): boolean[] {
    if (!equipe) {
      return [];
    }
    return equipe.membres.map(
      membre => this.answers.get(membre.id) === this.correcteCourante,
    );
  }

  private isDuelingPlayer(playerId: string): boolean {
    const match = this.state.currentMatch;
    if (!match) {
      return false;
    }
    const equipeA = this.findEquipe(match.equipeAId);
    const equipeB = this.findEquipe(match.equipeBId);
    const membres = [
      ...(equipeA?.membres ?? []),
      ...(equipeB?.membres ?? []),
    ];
    return membres.some(m => m.id === playerId);
  }

  private expectedAnswerCount(): number {
    const match = this.state.currentMatch;
    if (!match) {
      return 0;
    }
    const equipeA = this.findEquipe(match.equipeAId);
    const equipeB = this.findEquipe(match.equipeBId);
    return (equipeA?.membres.length ?? 0) + (equipeB?.membres.length ?? 0);
  }

  private startTimer(): void {
    this.clearTimer();
    this.timerHandle = setInterval(() => {
      if (this.state.deadline !== null && Date.now() >= this.state.deadline) {
        this.expireQuestion();
      }
    }, 250);
  }

  private clearTimer(): void {
    if (this.timerHandle !== null) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  }

  private setPhase(phase: EnginePhase): void {
    this.state.phase = phase;
    this.notify();
  }

  private setPhaseSilent(phase: EnginePhase): void {
    this.state.phase = phase;
  }

  private snapshot(): EngineState {
    return {
      ...this.state,
      players: [...this.state.players],
      equipes: this.state.equipes.map(e => ({
        ...e,
        membres: [...e.membres],
      })),
      bracket: this.state.bracket
        ? {
            ...this.state.bracket,
            rounds: this.state.bracket.rounds.map(round =>
              round.map(m => ({...m})),
            ),
          }
        : null,
      currentMatch: this.state.currentMatch
        ? {...this.state.currentMatch}
        : null,
      question: this.state.question ? {...this.state.question} : null,
      manches: {...this.state.manches},
      classement: this.state.classement.map(c => ({...c})),
    };
  }

  private notify(): void {
    const snap = this.snapshot();
    this.listeners.forEach(listener => listener(snap));
  }
}
