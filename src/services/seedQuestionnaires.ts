import {v4 as uuidv4} from 'uuid';

import {QUESTIONS_PAR_DUEL} from '@/constants';
import {QuestionnaireRepository} from '@/data/sqlite/QuestionnaireRepository';
import type {CreateQuestionInput} from '@/types/repository';

const LETTRES: ReadonlyArray<string> = ['A', 'B', 'C', 'D'];

function buildQuestions(prefixe: string): CreateQuestionInput[] {
  return Array.from({length: QUESTIONS_PAR_DUEL}, (_, i) => {
    const correcteIndex = i % 4;
    return {
      texte: `${prefixe} — Question ${i + 1} : quelle réponse est correcte ?`,
      options: [
        `${prefixe} Q${i + 1} option A`,
        `${prefixe} Q${i + 1} option B`,
        `${prefixe} Q${i + 1} option C`,
        `${prefixe} Q${i + 1} option D`,
      ] as [string, string, string, string],
      reponse_correcte: `${prefixe} Q${i + 1} option ${LETTRES[correcteIndex]}`,
    };
  });
}

export interface SeededQuestionnaire {
  id: string;
  titre: string;
}

/**
 * Crée `count` questionnaires de démonstration (10 questions chacun) liés à une
 * partie. Utilisé par le parcours hôte local (S3) et le pré-chargement LAN (S5).
 */
export function seedQuestionnaires(
  partieId: string,
  count: number,
  repo: QuestionnaireRepository = new QuestionnaireRepository(),
): SeededQuestionnaire[] {
  const created: SeededQuestionnaire[] = [];

  for (let i = 0; i < count; i += 1) {
    const id = uuidv4();
    const titre = `Questionnaire démo ${i + 1}`;
    repo.createQuestionnaire({
      id,
      partie_id: partieId,
      titre,
      source: 'public',
      questions: buildQuestions(titre),
    });
    created.push({id, titre});
  }

  return created;
}
