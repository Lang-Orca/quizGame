import {v4 as uuidv4} from 'uuid';

import {PublicCatalogRepository} from '@/data/sqlite/PublicCatalogRepository';
import {QuestionnaireRepository} from '@/data/sqlite/QuestionnaireRepository';
import {initDatabase, resetDatabaseForTests} from '@/data/sqlite/database';
import {PublicCatalogService} from '@/services/PublicCatalogService';
import type {CreateQuestionInput} from '@/types/repository';

import {__resetFirebaseStore} from '../../__mocks__/firebaseRtdbStore';

function buildQuestions(n: number): CreateQuestionInput[] {
  return Array.from({length: n}, (_, i) => ({
    texte: `Question ${i} ?`,
    options: ['A', 'B', 'C', 'D'] as [string, string, string, string],
    reponse_correcte: 'A',
  }));
}

describe('PublicCatalogService', () => {
  beforeEach(async () => {
    __resetFirebaseStore();
    resetDatabaseForTests();
    await initDatabase();
  });

  it('publie un questionnaire public, le liste puis le télécharge', async () => {
    const questionnaireRepo = new QuestionnaireRepository();
    const cacheRepo = new PublicCatalogRepository();
    const service = new PublicCatalogService({questionnaireRepo, cacheRepo});

    const sourceId = uuidv4();
    questionnaireRepo.createQuestionnaire({
      id: sourceId,
      titre: 'Catalogue test',
      source: 'ia',
      is_public: true,
      questions: buildQuestions(10),
    });

    await service.publish(sourceId, 'Marco');

    const list = await service.fetchPublicList();
    expect(list).toHaveLength(1);
    expect(list[0].titre).toBe('Catalogue test');
    expect(list[0].nb_questions).toBe(10);
    expect(list[0].auteur).toBe('Marco');

    const localId = await service.downloadQuestionnaire(list[0].firebaseId);
    expect(cacheRepo.isDownloaded(list[0].firebaseId)).toBe(true);

    const meta = questionnaireRepo.getQuestionnaireMeta(localId);
    expect(meta?.source).toBe('public');
    expect(questionnaireRepo.countQuestions(localId)).toBe(10);
  });

  it('ne publie pas un questionnaire non public', async () => {
    const questionnaireRepo = new QuestionnaireRepository();
    const service = new PublicCatalogService({questionnaireRepo});

    const sourceId = uuidv4();
    questionnaireRepo.createQuestionnaire({
      id: sourceId,
      titre: 'Privé',
      source: 'ia',
      is_public: false,
      questions: buildQuestions(10),
    });

    await service.publish(sourceId, null);
    const list = await service.fetchPublicList();
    expect(list).toHaveLength(0);
  });
});
