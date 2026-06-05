import {getDb} from './database';

export interface ClassementJoueur {
  pseudo: string;
  points_totaux: number;
  parties_jouees: number;
  victoires: number;
}

/**
 * Classement cumulé des joueurs par pseudo (table classement_joueurs).
 * Mis à jour en fin de partie côté hôte.
 */
export class ClassementRepository {
  getByPseudo(pseudo: string): ClassementJoueur | null {
    const db = getDb();
    const result = db.execute(
      'SELECT * FROM classement_joueurs WHERE pseudo = ?',
      [pseudo],
    );
    if (!result.rows || result.rows.length === 0) {
      return null;
    }
    const row = result.rows.item(0);
    return {
      pseudo: row.pseudo as string,
      points_totaux: Number(row.points_totaux),
      parties_jouees: Number(row.parties_jouees),
      victoires: Number(row.victoires),
    };
  }

  recordResult(pseudo: string, pointsDelta: number, won: boolean): void {
    const db = getDb();
    const existing = this.getByPseudo(pseudo);
    if (existing) {
      db.execute(
        `UPDATE classement_joueurs
         SET points_totaux = ?, parties_jouees = ?, victoires = ?
         WHERE pseudo = ?`,
        [
          existing.points_totaux + pointsDelta,
          existing.parties_jouees + 1,
          existing.victoires + (won ? 1 : 0),
          pseudo,
        ],
      );
      return;
    }
    db.execute(
      `INSERT INTO classement_joueurs
       (pseudo, points_totaux, parties_jouees, victoires)
       VALUES (?, ?, ?, ?)`,
      [pseudo, pointsDelta, 1, won ? 1 : 0],
    );
  }

  getAll(): ClassementJoueur[] {
    const db = getDb();
    const result = db.execute(
      'SELECT * FROM classement_joueurs ORDER BY points_totaux DESC',
    );
    const entries: ClassementJoueur[] = [];
    if (!result.rows) {
      return entries;
    }
    for (let i = 0; i < result.rows.length; i += 1) {
      const row = result.rows.item(i);
      entries.push({
        pseudo: row.pseudo as string,
        points_totaux: Number(row.points_totaux),
        parties_jouees: Number(row.parties_jouees),
        victoires: Number(row.victoires),
      });
    }
    return entries;
  }
}
