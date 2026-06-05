import {v4 as uuidv4} from 'uuid';

import type {
  CachedPublicQuestionnaire,
  PublicQuestionnaireSummary,
} from '@/types/catalog';

import {getDb} from './database';

/**
 * Cache local des questionnaires publics téléchargés
 * (table questionnaires_publics_cache).
 */
export class PublicCatalogRepository {
  insertCache(
    summary: PublicQuestionnaireSummary,
    localQuestionnaireId: string,
  ): void {
    const db = getDb();
    db.execute(
      `INSERT OR REPLACE INTO questionnaires_publics_cache
       (id, titre, auteur, date_publication, nb_questions, firebase_id, date_telecharge)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        localQuestionnaireId || uuidv4(),
        summary.titre,
        summary.auteur,
        summary.date_publication,
        summary.nb_questions,
        summary.firebaseId,
        Date.now(),
      ],
    );
  }

  getAllCached(): CachedPublicQuestionnaire[] {
    const db = getDb();
    const result = db.execute(
      'SELECT * FROM questionnaires_publics_cache ORDER BY date_telecharge DESC',
    );

    const entries: CachedPublicQuestionnaire[] = [];
    if (!result.rows) {
      return entries;
    }
    for (let i = 0; i < result.rows.length; i += 1) {
      const row = result.rows.item(i);
      entries.push({
        localId: row.id as string,
        titre: row.titre as string,
        auteur: row.auteur as string | null,
        date_publication: Number(row.date_publication),
        nb_questions: Number(row.nb_questions),
        firebaseId: row.firebase_id as string,
        date_telecharge: Number(row.date_telecharge),
      });
    }
    return entries;
  }

  isDownloaded(firebaseId: string): boolean {
    const db = getDb();
    const result = db.execute(
      'SELECT id FROM questionnaires_publics_cache WHERE firebase_id = ?',
      [firebaseId],
    );
    return Boolean(result.rows && result.rows.length > 0);
  }

  getLocalId(firebaseId: string): string | null {
    const db = getDb();
    const result = db.execute(
      'SELECT id FROM questionnaires_publics_cache WHERE firebase_id = ?',
      [firebaseId],
    );
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    return result.rows.item(0).id as string;
  }
}
