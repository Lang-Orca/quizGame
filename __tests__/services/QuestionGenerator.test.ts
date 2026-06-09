import {ApiKeyStore} from '@/services/ApiKeyStore';
import {
  GenerationInvalideError,
  HorsLigneError,
  QuestionGenerator,
} from '@/services/QuestionGenerator';
import type {QuestionnaireRepository} from '@/data/sqlite/QuestionnaireRepository';

import {__resetKeychain} from '../../__mocks__/react-native-keychain';

function buildQuestions(n: number) {
  return Array.from({length: n}, (_, i) => ({
    question: `Question ${i} ?`,
    options: ['A', 'B', 'C', 'D'],
    reponse_correcte: 'A',
  }));
}

function geminiResponse(text: string) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [{content: {parts: [{text}]}}],
    }),
  } as unknown as Response;
}

function makeRepo() {
  const createQuestionnaire = jest.fn();
  const repo = {createQuestionnaire} as unknown as QuestionnaireRepository;
  return {repo, createQuestionnaire};
}

describe('QuestionGenerator', () => {
  beforeEach(() => {
    __resetKeychain();
  });

  async function withKey() {
    const store = new ApiKeyStore();
    await store.save('test-key');
    return store;
  }

  it('génère et insère 10+ QCM à partir d’un JSON valide', async () => {
    const apiKeyStore = await withKey();
    const {repo, createQuestionnaire} = makeRepo();
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(geminiResponse(JSON.stringify(buildQuestions(10))));

    const generator = new QuestionGenerator({
      apiKeyStore,
      questionnaireRepo: repo,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const result = await generator.generateFromText('texte source', {
      titre: 'Test',
    });

    expect(result.nbQuestions).toBe(10);
    expect(createQuestionnaire).toHaveBeenCalledTimes(1);
    expect(createQuestionnaire.mock.calls[0][0].source).toBe('ia');
  });

  it('lève HorsLigneError quand le réseau échoue', async () => {
    const apiKeyStore = await withKey();
    const {repo} = makeRepo();
    const fetchImpl = jest.fn().mockRejectedValue(new Error('Network request failed'));

    const generator = new QuestionGenerator({
      apiKeyStore,
      questionnaireRepo: repo,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(
      generator.generateFromText('texte', {titre: 'Test'}),
    ).rejects.toBeInstanceOf(HorsLigneError);
  });

  it('n’insère rien si le JSON est invalide', async () => {
    const apiKeyStore = await withKey();
    const {repo, createQuestionnaire} = makeRepo();
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(geminiResponse('ceci n’est pas du JSON'));

    const generator = new QuestionGenerator({
      apiKeyStore,
      questionnaireRepo: repo,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(
      generator.generateFromText('texte', {titre: 'Test'}),
    ).rejects.toBeInstanceOf(GenerationInvalideError);
    expect(createQuestionnaire).not.toHaveBeenCalled();
  });

  it('rejette un questionnaire avec moins de 10 questions valides', async () => {
    const apiKeyStore = await withKey();
    const {repo, createQuestionnaire} = makeRepo();
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(geminiResponse(JSON.stringify(buildQuestions(3))));

    const generator = new QuestionGenerator({
      apiKeyStore,
      questionnaireRepo: repo,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(
      generator.generateFromText('texte', {titre: 'Test'}),
    ).rejects.toBeInstanceOf(GenerationInvalideError);
    expect(createQuestionnaire).not.toHaveBeenCalled();
  });
});
