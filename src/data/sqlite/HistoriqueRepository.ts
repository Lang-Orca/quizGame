import type {HistoriqueEntry} from '@/types/repository';

import {getDb} from './database';

export class HistoriqueRepository {
  insertHistorique(entry: HistoriqueEntry): void {
    const db = getDb();
    db.execute(
      `INSERT INTO historique_parties
       (id, partie_id, date_partie, nom_partie, nom_questionnaire, equipe_gagnante, mode)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.partie_id,
        entry.date_partie,
        entry.nom_partie,
        entry.nom_questionnaire,
        entry.equipe_gagnante,
        entry.mode,
      ],
    );
  }

  getAll(): HistoriqueEntry[] {
    const db = getDb();
    const result = db.execute(
      'SELECT * FROM historique_parties ORDER BY date_partie DESC',
    );

    const entries: HistoriqueEntry[] = [];
    if (!result.rows) {
      return entries;
    }

    for (let i = 0; i < result.rows.length; i += 1) {
      const row = result.rows.item(i);
      entries.push({
        id: row.id as string,
        partie_id: row.partie_id as string,
        date_partie: Number(row.date_partie),
        nom_partie: row.nom_partie as string,
        nom_questionnaire: row.nom_questionnaire as string,
        equipe_gagnante: row.equipe_gagnante as string,
        mode: row.mode as HistoriqueEntry['mode'],
      });
    }

    return entries;
  }
}
