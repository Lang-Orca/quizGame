import {initDatabase, resetDatabaseForTests} from '@/data/sqlite/database';
import {PartieRepository} from '@/data/sqlite/PartieRepository';
import {QuestionnaireRepository} from '@/data/sqlite/QuestionnaireRepository';

describe('PartieRepository', () => {
  const partieRepo = new PartieRepository();
  const questionnaireRepo = new QuestionnaireRepository();

  beforeEach(async () => {
    resetDatabaseForTests();
    await initDatabase();
  });

  it('crée et met à jour une partie', () => {
    const partie = partieRepo.createPartie({
      id: 'p1',
      nom: 'Ma partie',
      mode: 'lan',
      code: 'AB12CD',
    });

    expect(partie.statut).toBe('lobby');

    partieRepo.updateStatut('p1', 'tournoi');
    const updated = partieRepo.getPartie('p1');
    expect(updated?.statut).toBe('tournoi');
  });

  it('lie un questionnaire à une partie', () => {
    partieRepo.createPartie({id: 'p2', nom: 'LAN', mode: 'lan'});
    questionnaireRepo.createQuestionnaire({
      id: 'q10',
      titre: 'Quiz LAN',
      source: 'public',
      questions: [
        {
          texte: 'Q1 ?',
          options: ['A', 'B', 'C', 'D'],
          reponse_correcte: 'B',
        },
      ],
    });

    partieRepo.linkQuestionnaire('p2', 'q10');
    const meta = questionnaireRepo.getQuestionnaireMeta('q10');
    expect(meta?.partie_id).toBe('p2');
  });
});
