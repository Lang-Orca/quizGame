import {v4 as uuidv4} from 'uuid';

import type {
  CreateQuestionnaireInput,
  QuestionnaireMeta,
} from '@/types/repository';
import type {QuestionOptions} from '@/types/question';
import type {QuestionPlayerView} from '@/types/question';

import {getDb} from './database';
import {HOST_TOKEN} from './hostToken';

export class UnauthorizedHostAccessError extends Error {
  constructor() {
    super('Accès hôte non autorisé.');
    this.name = 'UnauthorizedHostAccessError';
  }
}

export interface QuestionHostView extends QuestionPlayerView {
  reponse_correcte: string;
}

export class QuestionnaireRepository {
  createQuestionnaire(data: CreateQuestionnaireInput): void {
    const db = getDb();
    const now = Date.now();

    db.execute('BEGIN TRANSACTION');
    try {
      db.execute(
        `INSERT INTO questionnaires
         (id, partie_id, titre, date_creation, statut, source, is_public, duel_id, round_index)
         VALUES (?, ?, ?, ?, 'verrouille', ?, ?, ?, ?)`,
        [
          data.id,
          data.partie_id ?? null,
          data.titre,
          now,
          data.source,
          data.is_public ? 1 : 0,
          data.duel_id ?? null,
          data.round_index ?? null,
        ],
      );

      data.questions.forEach((question, index) => {
        db.execute(
          `INSERT INTO questions
           (id, questionnaire_id, index_ordre, texte_question, options, reponse_correcte)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            data.id,
            index,
            question.texte,
            JSON.stringify(question.options),
            question.reponse_correcte,
          ],
        );
      });

      db.execute('COMMIT');
    } catch (error) {
      db.execute('ROLLBACK');
      throw error;
    }
  }

  getQuestionnaireMeta(id: string): QuestionnaireMeta | null {
    const db = getDb();
    const result = db.execute(
      `SELECT id, partie_id, titre, date_creation, statut, source, is_public, duel_id, round_index
       FROM questionnaires WHERE id = ?`,
      [id],
    );

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const row = result.rows.item(0);
    return {
      id: row.id as string,
      partie_id: row.partie_id as string | null,
      titre: row.titre as string,
      date_creation: Number(row.date_creation),
      statut: row.statut as QuestionnaireMeta['statut'],
      source: row.source as QuestionnaireMeta['source'],
      is_public: Boolean(row.is_public),
      duel_id: row.duel_id as string | null,
      round_index:
        row.round_index === null || row.round_index === undefined
          ? null
          : Number(row.round_index),
    };
  }

  isQuestionnaireAccessible(id: string): boolean {
    const meta = this.getQuestionnaireMeta(id);
    if (!meta) {
      return false;
    }
    return meta.statut === 'termine';
  }

  getQuestionsForPlayer(questionnaireId: string): QuestionPlayerView[] {
    const db = getDb();
    const result = db.execute(
      `SELECT id, index_ordre, texte_question, options
       FROM questions
       WHERE questionnaire_id = ?
       ORDER BY index_ordre ASC`,
      [questionnaireId],
    );

    const questions: QuestionPlayerView[] = [];
    if (!result.rows) {
      return questions;
    }

    for (let i = 0; i < result.rows.length; i += 1) {
      const row = result.rows.item(i);
      questions.push({
        id: row.id as string,
        index_ordre: Number(row.index_ordre),
        texte_question: row.texte_question as string,
        options: JSON.parse(row.options as string) as QuestionOptions,
      });
    }

    return questions;
  }

  getQuestionsForHost(
    questionnaireId: string,
    token: symbol,
  ): QuestionHostView[] {
    if (token !== HOST_TOKEN) {
      throw new UnauthorizedHostAccessError();
    }

    const db = getDb();
    const result = db.execute(
      `SELECT id, index_ordre, texte_question, options, reponse_correcte
       FROM questions
       WHERE questionnaire_id = ?
       ORDER BY index_ordre ASC`,
      [questionnaireId],
    );

    const questions: QuestionHostView[] = [];
    if (!result.rows) {
      return questions;
    }

    for (let i = 0; i < result.rows.length; i += 1) {
      const row = result.rows.item(i);
      questions.push({
        id: row.id as string,
        index_ordre: Number(row.index_ordre),
        texte_question: row.texte_question as string,
        options: JSON.parse(row.options as string) as QuestionOptions,
        reponse_correcte: row.reponse_correcte as string,
      });
    }

    return questions;
  }

  deverrouillerQuestionnaires(partieId: string): void {
    const db = getDb();
    db.execute(
      `UPDATE questionnaires SET statut = 'termine' WHERE partie_id = ? AND statut = 'verrouille'`,
      [partieId],
    );
  }
}
