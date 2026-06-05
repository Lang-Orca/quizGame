import {initDatabase, resetDatabaseForTests} from '@/data/sqlite/database';
import {QuestionnaireRepository} from '@/data/sqlite/QuestionnaireRepository';
import {
  HostQuestionService,
  QuestionnaireVerrouilleError,
} from '@/services/HostQuestionService';

const sampleQuestions = Array.from({length: 10}, (_, i) => ({
  texte: `Question ${i + 1} ?`,
  options: ['A', 'B', 'C', 'D'] as [string, string, string, string],
  reponse_correcte: 'B',
}));

describe('HostQuestionService', () => {
  const repo = new QuestionnaireRepository();
  const service = new HostQuestionService();

  beforeEach(async () => {
    resetDatabaseForTests();
    await initDatabase();
    repo.createQuestionnaire({
      id: 'hq1',
      titre: 'Host Service Quiz',
      source: 'ia',
      questions: sampleQuestions,
    });
  });

  it('refuse la consultation d un questionnaire verrouillé', () => {
    expect(() => service.getQuestionWithAnswer('hq1', 0)).toThrow(
      QuestionnaireVerrouilleError,
    );
  });

  it('autorise la lecture pendant une partie active', () => {
    const question = service.getQuestionWithAnswer('hq1', 0, true);
    expect(question.reponse_correcte).toBe('B');
  });

  it('construit un reveal payload avec optionCorrecte', () => {
    const payload = service.buildRevealPayload({
      duelId: 'match_1',
      questionIndex: 0,
      optionCorrecte: 'B',
      reponsesA: [true, false],
      reponsesB: [true, true],
    });

    expect(payload.optionCorrecte).toBe('B');
    expect(payload.mancheGagnante).toBe('B');
    expect(payload.scoresManche.equipeB).toBe(2);
  });

  it('valide une réponse joueur', () => {
    expect(service.correctPlayerAnswer('B', 'B')).toBe(true);
    expect(service.correctPlayerAnswer('A', 'B')).toBe(false);
  });
});
