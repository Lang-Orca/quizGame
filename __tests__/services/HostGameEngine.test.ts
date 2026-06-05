import {ClassementRepository} from '@/data/sqlite/ClassementRepository';
import {HistoriqueRepository} from '@/data/sqlite/HistoriqueRepository';
import {initDatabase, resetDatabaseForTests} from '@/data/sqlite/database';
import {HOST_TOKEN} from '@/data/sqlite/hostToken';
import {QuestionnaireRepository} from '@/data/sqlite/QuestionnaireRepository';
import {
  HostGameEngine,
  QuestionnaireNeededError,
} from '@/services/HostGameEngine';
import {seedQuestionnaires} from '@/services/seedQuestionnaires';
import {InMemorySessionSync} from '@/sync/InMemorySessionSync';
import type {EngineState} from '@/services/HostGameEngine';

const repo = new QuestionnaireRepository();

function correctOptionFor(questionnaireId: string, index: number): string {
  const questions = repo.getQuestionsForHost(questionnaireId, HOST_TOKEN);
  const question = questions.find(q => q.index_ordre === index);
  if (!question) {
    throw new Error('Question introuvable dans le test');
  }
  return question.reponse_correcte;
}

function membersOf(state: EngineState, equipeId: string) {
  return state.equipes.find(e => e.id === equipeId)?.membres ?? [];
}

async function setupLockedGame(nbPlayers: number) {
  const sync = new InMemorySessionSync();
  const engine = new HostGameEngine({sync, mode: 'lan'});
  await engine.createSession('Salon test');

  for (let i = 0; i < nbPlayers; i += 1) {
    sync.addPlayer(`Joueur ${i + 1}`);
  }

  engine.lockSalon();

  const bracket = engine.getState().bracket!;
  const partieId = engine.getState().partieId!;
  const questionnaireIds: string[] = [];
  bracket.rounds.forEach((round, roundIndex) => {
    const seeded = seedQuestionnaires(partieId, round.length);
    seeded.forEach(q => questionnaireIds.push(q.id));
    engine.setRoundQuestionnaires(
      roundIndex,
      seeded.map(q => q.id),
    );
  });

  return {sync, engine, questionnaireIds};
}

/** Joue le duel en cours entièrement en faisant gagner l'équipe A. */
function playDuelEquipeAWins(
  engine: HostGameEngine,
  sync: InMemorySessionSync,
): void {
  while (engine.getState().phase === 'duel') {
    const state = engine.getState();
    const match = state.currentMatch!;
    const question = state.question!;
    const correct = correctOptionFor(match.questionnaireId!, question.index);
    const wrong = question.options.find(o => o !== correct)!;

    membersOf(state, match.equipeAId).forEach(m =>
      sync.submitAnswerAs(m.id, correct),
    );
    membersOf(state, match.equipeBId).forEach(m =>
      sync.submitAnswerAs(m.id, wrong),
    );

    if (engine.getState().duelPhase === 'reveal') {
      engine.nextQuestion();
    }
  }
}

function playUntilFinished(
  engine: HostGameEngine,
  sync: InMemorySessionSync,
): void {
  let guard = 0;
  while (engine.getState().phase !== 'finished' && guard < 20) {
    if (engine.getState().phase === 'tournament') {
      engine.startNextMatch();
    }
    playDuelEquipeAWins(engine, sync);
    guard += 1;
  }
}

async function setupRound0Only(nbPlayers: number) {
  const sync = new InMemorySessionSync();
  const engine = new HostGameEngine({sync, mode: 'lan'});
  await engine.createSession('Salon test');
  for (let i = 0; i < nbPlayers; i += 1) {
    sync.addPlayer(`Joueur ${i + 1}`);
  }
  engine.lockSalon();
  const partieId = engine.getState().partieId!;
  const bracket = engine.getState().bracket!;
  const seeded = seedQuestionnaires(partieId, bracket.rounds[0].length);
  engine.setRoundQuestionnaires(
    0,
    seeded.map(q => q.id),
  );
  return {sync, engine, partieId};
}

describe('HostGameEngine', () => {
  beforeEach(async () => {
    resetDatabaseForTests();
    await initDatabase();
  });

  it('passe en lobby après création de session', async () => {
    const sync = new InMemorySessionSync();
    const engine = new HostGameEngine({sync, mode: 'lan'});
    await engine.createSession('Salon');

    expect(engine.getState().phase).toBe('lobby');
    expect(engine.getState().sessionId).toHaveLength(6);
  });

  it('forme les équipes et le bracket au verrouillage', async () => {
    const {engine} = await setupLockedGame(10);
    const state = engine.getState();

    expect(state.phase).toBe('tournament');
    expect(state.equipes).toHaveLength(4);
    expect(state.bracket?.rounds[0]).toHaveLength(2);
  });

  it('révèle la manche quand toutes les réponses sont reçues', async () => {
    const {engine, sync} = await setupLockedGame(4);
    engine.startNextMatch();

    const state = engine.getState();
    const match = state.currentMatch!;
    const correct = correctOptionFor(match.questionnaireId!, 0);

    membersOf(state, match.equipeAId).forEach(m =>
      sync.submitAnswerAs(m.id, correct),
    );
    membersOf(state, match.equipeBId).forEach(m =>
      sync.submitAnswerAs(m.id, correct),
    );

    expect(engine.getState().duelPhase).toBe('reveal');
  });

  it('résout la question à l expiration du timer (non-réponse = incorrect)', async () => {
    const {engine} = await setupLockedGame(4);
    engine.startNextMatch();

    engine.expireQuestion();

    const state = engine.getState();
    expect(state.duelPhase).toBe('reveal');
    expect(state.lastReveal?.mancheGagnante).toBe('egalite');
  });

  it('joue un tournoi 4 équipes complet jusqu au vainqueur', async () => {
    const {engine, sync} = await setupLockedGame(4);

    playUntilFinished(engine, sync);

    const state = engine.getState();
    expect(state.phase).toBe('finished');
    expect(state.vainqueurTournoiId).not.toBeNull();
    expect(state.classement).toHaveLength(4);
    engine.disconnect();
  });

  it('déverrouille les questionnaires en fin de partie', async () => {
    const {engine, sync, questionnaireIds} = await setupLockedGame(4);

    expect(
      repo.getQuestionnaireMeta(questionnaireIds[0])?.statut,
    ).toBe('verrouille');

    playUntilFinished(engine, sync);

    expect(repo.getQuestionnaireMeta(questionnaireIds[0])?.statut).toBe(
      'termine',
    );
    engine.disconnect();
  });

  it('exige un questionnaire au round suivant en offline (S6)', async () => {
    const {engine, sync} = await setupRound0Only(4);

    engine.startNextMatch();
    playDuelEquipeAWins(engine, sync);
    engine.startNextMatch();
    playDuelEquipeAWins(engine, sync);

    expect(engine.nextMatchNeedsQuestionnaire()).toBe(true);
    expect(() => engine.startNextMatch()).toThrow(QuestionnaireNeededError);
    engine.disconnect();
  });

  it('assigne duel_id/round_index et utilise des questionnaires distincts (S6)', async () => {
    const {engine, sync, partieId} = await setupRound0Only(4);

    engine.startNextMatch();
    playDuelEquipeAWins(engine, sync);
    engine.startNextMatch();
    playDuelEquipeAWins(engine, sync);

    const finalMatch = engine.peekNextMatch()!;
    const [seeded] = seedQuestionnaires(partieId, 1);
    engine.assignQuestionnaire(finalMatch.id, seeded.id);

    engine.startNextMatch();
    playDuelEquipeAWins(engine, sync);

    expect(engine.getState().phase).toBe('finished');

    const meta = repo.getQuestionnaireMeta(seeded.id)!;
    expect(meta.duel_id).toBe(finalMatch.id);
    expect(meta.round_index).toBe(1);

    const ids = engine
      .getState()
      .bracket!.rounds.flat()
      .map(m => m.questionnaireId)
      .filter((id): id is string => Boolean(id));
    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(3);
    engine.disconnect();
  });

  it('journalise l historique et met à jour le classement en fin de partie (S10)', async () => {
    const {engine, sync} = await setupLockedGame(4);

    playUntilFinished(engine, sync);

    const historique = new HistoriqueRepository().getAll();
    expect(historique).toHaveLength(1);
    expect(historique[0].mode).toBe('lan');
    expect(historique[0].equipe_gagnante).toBeTruthy();

    const classement = new ClassementRepository().getAll();
    // 4 joueurs, chacun a joué une partie.
    expect(classement).toHaveLength(4);
    expect(classement.every(c => c.parties_jouees === 1)).toBe(true);
    // Au moins un joueur a remporté la partie.
    expect(classement.some(c => c.victoires === 1)).toBe(true);
    engine.disconnect();
  });
});
