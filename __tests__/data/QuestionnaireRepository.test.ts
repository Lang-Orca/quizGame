import {initDatabase, resetDatabaseForTests} from '@/data/sqlite/database';
import {
  QuestionnaireRepository,
  UnauthorizedHostAccessError,
} from '@/data/sqlite/QuestionnaireRepository';
import {HOST_TOKEN} from '@/data/sqlite/hostToken';

const sampleQuestions = Array.from({length: 10}, (_, i) => ({
  texte: `Question ${i + 1} ?`,
  options: ['A', 'B', 'C', 'D'] as [string, string, string, string],
  reponse_correcte: 'A',
}));

describe('QuestionnaireRepository', () => {
  const repo = new QuestionnaireRepository();

  beforeEach(async () => {
    resetDatabaseForTests();
    await initDatabase();
  });

  it('insère un questionnaire et 10 questions en transaction', () => {
    repo.createQuestionnaire({
      id: 'q1',
      titre: 'Test Quiz',
      source: 'ia',
      questions: sampleQuestions,
    });

    const meta = repo.getQuestionnaireMeta('q1');
    expect(meta?.titre).toBe('Test Quiz');
    expect(meta?.statut).toBe('verrouille');

    const playerQuestions = repo.getQuestionsForPlayer('q1');
    expect(playerQuestions).toHaveLength(10);
    playerQuestions.forEach(q => {
      expect(q).not.toHaveProperty('reponse_correcte');
    });
  });

  it('refuse getQuestionsForHost sans token', () => {
    repo.createQuestionnaire({
      id: 'q2',
      titre: 'Secure Quiz',
      source: 'ia',
      questions: sampleQuestions,
    });

    expect(() => repo.getQuestionsForHost('q2', Symbol('fake'))).toThrow(
      UnauthorizedHostAccessError,
    );
  });

  it('expose les réponses avec HOST_TOKEN', () => {
    repo.createQuestionnaire({
      id: 'q3',
      titre: 'Host Quiz',
      source: 'ia',
      questions: sampleQuestions,
    });

    const hostQuestions = repo.getQuestionsForHost('q3', HOST_TOKEN);
    expect(hostQuestions[0].reponse_correcte).toBe('A');
  });

  it('déverrouille les questionnaires d une partie', () => {
    repo.createQuestionnaire({
      id: 'q4',
      partie_id: 'p1',
      titre: 'Partie Quiz',
      source: 'ia',
      questions: sampleQuestions,
    });

    expect(repo.isQuestionnaireAccessible('q4')).toBe(false);
    repo.deverrouillerQuestionnaires('p1');
    expect(repo.isQuestionnaireAccessible('q4')).toBe(true);
  });
});
