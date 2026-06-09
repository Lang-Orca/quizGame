import {v4 as uuidv4} from 'uuid';

import {
  GEMINI_BASE_URL,
  GEMINI_MODEL,
  QCM_MIN_GENERES,
} from '@/constants';
import {QuestionnaireRepository} from '@/data/sqlite/QuestionnaireRepository';
import type {CreateQuestionInput} from '@/types/repository';
import type {QuestionOptions} from '@/types/question';

import {ApiKeyStore} from './ApiKeyStore';
import {QuestionnaireIaSchema} from './ai/questionnaireSchema';

export class CleApiManquanteError extends Error {
  constructor() {
    super(
      'Aucune clé API Gemini configurée. Renseignez-la dans les Paramètres.',
    );
    this.name = 'CleApiManquanteError';
  }
}

export class HorsLigneError extends Error {
  constructor() {
    super('Vous devez être connecté pour générer des questions.');
    this.name = 'HorsLigneError';
  }
}

export class GenerationInvalideError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GenerationInvalideError';
  }
}

export interface GenerateOptions {
  titre: string;
  isPublic?: boolean;
  nombre?: number;
}

export interface GenerateResult {
  questionnaireId: string;
  nbQuestions: number;
}

interface QuestionGeneratorDeps {
  apiKeyStore?: ApiKeyStore;
  questionnaireRepo?: QuestionnaireRepository;
  fetchImpl?: typeof fetch;
}

/**
 * Génère un questionnaire QCM à partir d'un texte (extrait localement d'un PDF)
 * via l'API Google Gemini, valide le JSON (Zod) et l'insère en SQLite.
 */
export class QuestionGenerator {
  private readonly apiKeyStore: ApiKeyStore;
  private readonly questionnaireRepo: QuestionnaireRepository;
  private readonly fetchImpl: typeof fetch;

  constructor(deps: QuestionGeneratorDeps = {}) {
    this.apiKeyStore = deps.apiKeyStore ?? new ApiKeyStore();
    this.questionnaireRepo =
      deps.questionnaireRepo ?? new QuestionnaireRepository();
    this.fetchImpl = deps.fetchImpl ?? fetch;
  }

  async generateFromText(
    sourceText: string,
    options: GenerateOptions,
  ): Promise<GenerateResult> {
    const apiKey = await this.apiKeyStore.get();
    if (!apiKey) {
      throw new CleApiManquanteError();
    }

    const nombre = options.nombre ?? QCM_MIN_GENERES;
    const prompt = buildPrompt(sourceText, nombre);

    const raw = await this.callGemini(apiKey, prompt);
    const parsed = this.parseAndValidate(raw);

    if (parsed.length < QCM_MIN_GENERES) {
      throw new GenerationInvalideError(
        `L'IA n'a produit que ${parsed.length} question(s) valides (minimum ${QCM_MIN_GENERES}).`,
      );
    }

    const questions: CreateQuestionInput[] = parsed.map(q => ({
      texte: q.question,
      options: q.options as QuestionOptions,
      reponse_correcte: q.reponse_correcte,
    }));

    const questionnaireId = uuidv4();
    this.questionnaireRepo.createQuestionnaire({
      id: questionnaireId,
      titre: options.titre,
      source: 'ia',
      is_public: options.isPublic ?? false,
      questions,
    });

    return {questionnaireId, nbQuestions: questions.length};
  }

  private async callGemini(apiKey: string, prompt: string): Promise<string> {
    const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contents: [{parts: [{text: prompt}]}],
          generationConfig: {responseMimeType: 'application/json'},
        }),
      });
    } catch {
      // Erreur réseau (DNS, pas de connexion) → garde hors-ligne.
      throw new HorsLigneError();
    }

    if (!response.ok) {
      throw new GenerationInvalideError(
        `Erreur Gemini (HTTP ${response.status}).`,
      );
    }

    const json = (await response.json()) as GeminiResponse;
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new GenerationInvalideError('Réponse Gemini vide ou inattendue.');
    }
    return text;
  }

  private parseAndValidate(raw: string) {
    let data: unknown;
    try {
      data = JSON.parse(stripCodeFence(raw));
    } catch {
      throw new GenerationInvalideError(
        'La réponse de l\'IA n\'est pas un JSON valide.',
      );
    }

    const result = QuestionnaireIaSchema.safeParse(data);
    if (!result.success) {
      throw new GenerationInvalideError(
        'Le questionnaire généré ne respecte pas le format attendu.',
      );
    }
    return result.data;
  }
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {parts?: Array<{text?: string}>};
  }>;
}

/** Retire un éventuel bloc Markdown ```json ... ``` autour du JSON. */
function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

function buildPrompt(sourceText: string, nombre: number): string {
  return [
    `Tu es un générateur de QCM. À partir du texte fourni, génère ${nombre} questions`,
    'à choix multiple en français. Chaque question a exactement 4 options et une',
    'seule bonne réponse. Réponds UNIQUEMENT avec un tableau JSON, sans texte',
    'autour, au format :',
    '[{"question": "...", "options": ["A", "B", "C", "D"], "reponse_correcte": "A"}]',
    'La valeur de "reponse_correcte" doit être identique à l\'une des "options".',
    '',
    'TEXTE SOURCE :',
    sourceText,
  ].join('\n');
}
