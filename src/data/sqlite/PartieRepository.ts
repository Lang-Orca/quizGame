import type {CreatePartieInput} from '@/types/repository';
import type {Partie, PartieStatut} from '@/types/partie';

import {getDb} from './database';

export class PartieRepository {
  createPartie(input: CreatePartieInput): Partie {
    const db = getDb();
    const now = Date.now();

    db.execute(
      `INSERT INTO parties (id, nom, mode, code, statut, date_creation)
       VALUES (?, ?, ?, ?, 'lobby', ?)`,
      [input.id, input.nom, input.mode, input.code ?? null, now],
    );

    return {
      id: input.id,
      nom: input.nom,
      mode: input.mode,
      code: input.code ?? null,
      statut: 'lobby',
      equipe_gagnante_id: null,
      date_creation: now,
      date_fin: null,
    };
  }

  getPartie(id: string): Partie | null {
    const db = getDb();
    const result = db.execute('SELECT * FROM parties WHERE id = ?', [id]);
    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const row = result.rows.item(0);
    return {
      id: row.id as string,
      nom: row.nom as string,
      mode: row.mode as Partie['mode'],
      code: row.code as string | null,
      statut: row.statut as PartieStatut,
      equipe_gagnante_id: row.equipe_gagnante_id as string | null,
      date_creation: Number(row.date_creation),
      date_fin: row.date_fin ? Number(row.date_fin) : null,
    };
  }

  updateStatut(id: string, statut: PartieStatut): void {
    const db = getDb();
    db.execute('UPDATE parties SET statut = ? WHERE id = ?', [statut, id]);
  }

  setGagnant(id: string, equipeGagnanteId: string): void {
    const db = getDb();
    const now = Date.now();
    db.execute(
      `UPDATE parties SET equipe_gagnante_id = ?, statut = 'fin', date_fin = ? WHERE id = ?`,
      [equipeGagnanteId, now, id],
    );
  }

  linkQuestionnaire(partieId: string, questionnaireId: string): void {
    const db = getDb();
    db.execute('UPDATE questionnaires SET partie_id = ? WHERE id = ?', [
      partieId,
      questionnaireId,
    ]);
  }
}
