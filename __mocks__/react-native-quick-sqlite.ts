type Row = Record<string, unknown>;

interface MockResult {
  rows: {
    length: number;
    item: (index: number) => Row;
  };
}

const tables: Record<string, Row[]> = {
  schema_version: [],
  parties: [],
  questionnaires: [],
  questions: [],
  historique_parties: [],
  classement_joueurs: [],
  questionnaires_publics_cache: [],
};

let transactionBackup: typeof tables | null = null;

function getTableFromSql(sql: string): string | null {
  const insert = sql.match(/INSERT(?:\s+OR\s+\w+)?\s+INTO\s+(\w+)/i);
  if (insert) return insert[1];
  const update = sql.match(/UPDATE\s+(\w+)/i);
  if (update) return update[1];
  const select = sql.match(/FROM\s+(\w+)/i);
  if (select) return select[1];
  const deleteMatch = sql.match(/DELETE\s+FROM\s+(\w+)/i);
  if (deleteMatch) return deleteMatch[1];
  return null;
}

function cloneTables(): typeof tables {
  return Object.fromEntries(
    Object.entries(tables).map(([key, rows]) => [key, rows.map(r => ({...r}))]),
  ) as typeof tables;
}

function restoreTables(snapshot: typeof tables): void {
  Object.keys(tables).forEach(key => {
    tables[key] = snapshot[key] ?? [];
  });
}

function makeResult(rows: Row[]): MockResult {
  return {
    rows: {
      length: rows.length,
      item: (index: number) => rows[index],
    },
  };
}

function runSql(sql: string, params: unknown[] = []): MockResult {
  const normalized = sql.trim().toUpperCase();

  if (normalized === 'BEGIN TRANSACTION') {
    transactionBackup = cloneTables();
    return makeResult([]);
  }

  if (normalized === 'COMMIT') {
    transactionBackup = null;
    return makeResult([]);
  }

  if (normalized === 'ROLLBACK') {
    if (transactionBackup) {
      restoreTables(transactionBackup);
    }
    transactionBackup = null;
    return makeResult([]);
  }

  if (normalized.startsWith('DELETE FROM')) {
    const table = getTableFromSql(sql);
    if (table && tables[table]) {
      tables[table] = [];
    }
    return makeResult([]);
  }

  if (/^INSERT(\s+OR\s+\w+)?\s+INTO/i.test(normalized)) {
    const table = getTableFromSql(sql);
    if (!table) return makeResult([]);

    const insertMatch = sql.match(/\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (!insertMatch) return makeResult([]);

    const columns = insertMatch[1].split(',').map(c => c.trim());
    const valuesClause = insertMatch[2].split(',').map(v => v.trim());

    const row: Row = {};
    let paramIndex = 0;
    valuesClause.forEach((valueToken, index) => {
      if (valueToken === '?') {
        row[columns[index]] = params[paramIndex];
        paramIndex += 1;
      } else {
        row[columns[index]] = valueToken.replace(/^'|'$/g, '');
      }
    });

    if (!tables[table]) {
      tables[table] = [];
    }

    // INSERT OR REPLACE : remplace une ligne existante de même clé primaire (id).
    const isReplace = /^INSERT\s+OR\s+REPLACE/i.test(normalized);
    if (isReplace && 'id' in row) {
      const existingIndex = tables[table].findIndex(r => r.id === row.id);
      if (existingIndex >= 0) {
        tables[table][existingIndex] = row;
        return makeResult([]);
      }
    }

    tables[table].push(row);
    return makeResult([]);
  }

  if (normalized.startsWith('UPDATE')) {
    const table = getTableFromSql(sql);
    if (!table || !tables[table]) return makeResult([]);

    const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/i);
    const whereMatch = sql.match(/WHERE\s+(.+)$/i);
    if (!setMatch || !whereMatch) return makeResult([]);

    const setParts = setMatch[1].split(',').map(s => s.trim());
    const whereParts = whereMatch[1].split(/\s+AND\s+/i).map(s => s.trim());

    tables[table] = tables[table].map(row => {
      let paramIndex = 0;
      const readToken = (token: string) => {
        if (token === '?') {
          const value = params[paramIndex];
          paramIndex += 1;
          return value;
        }
        return token.replace(/^'|'$/g, '');
      };

      const parseClause = (clause: string) => {
        const eqIndex = clause.indexOf('=');
        const col = clause.slice(0, eqIndex).trim();
        const rawValue = clause.slice(eqIndex + 1).trim();
        return {col, value: readToken(rawValue)};
      };

      const setUpdates = setParts.map(parseClause);
      const whereChecks = whereParts.map(parseClause);
      const matches = whereChecks.every(
        ({col, value}) => row[col] === value,
      );

      if (!matches) {
        return row;
      }

      const updated = {...row};
      setUpdates.forEach(({col, value}) => {
        updated[col] = value;
      });
      return updated;
    });

    return makeResult([]);
  }

  if (normalized.startsWith('SELECT')) {
    const table = getTableFromSql(sql);
    if (!table || !tables[table]) return makeResult([]);

    let rows = [...tables[table]];

    if (sql.includes('WHERE')) {
      const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER|\s*$)/i);
      if (whereMatch) {
        const clause = whereMatch[1].trim();
        if (clause.includes('=')) {
          const [col] = clause.split('=').map(s => s.trim());
          const value = params[0];
          rows = rows.filter(r => r[col] === value);
        }
        if (clause.includes('AND')) {
          const parts = clause.split(/\s+AND\s+/i);
          rows = rows.filter(r =>
            parts.every((part, idx) => {
              const [col] = part.split('=').map(s => s.trim());
              return r[col] === params[idx];
            }),
          );
        }
      }
    }

    if (sql.includes('ORDER BY')) {
      const orderMatch = sql.match(/ORDER BY\s+(\w+)\s+(ASC|DESC)?/i);
      if (orderMatch) {
        const col = orderMatch[1];
        const desc = orderMatch[2]?.toUpperCase() === 'DESC';
        rows.sort((a, b) => {
          const av = a[col] as number | string;
          const bv = b[col] as number | string;
          if (av < bv) return desc ? 1 : -1;
          if (av > bv) return desc ? -1 : 1;
          return 0;
        });
      }
    }

    if (sql.includes('LIMIT 1')) {
      rows = rows.slice(0, 1);
    }

    if (sql.includes('SELECT version FROM schema_version')) {
      return makeResult(tables.schema_version);
    }

    if (sql.includes('SELECT *')) {
      return makeResult(rows);
    }

    const selectCols = sql
      .match(/SELECT\s+(.+?)\s+FROM/i)?.[1]
      ?.split(',')
      .map(c => c.trim());

    if (selectCols && !selectCols.includes('*')) {
      rows = rows.map(row => {
        const projected: Row = {};
        selectCols.forEach(col => {
          projected[col] = row[col];
        });
        return projected;
      });
    }

    return makeResult(rows);
  }

  if (normalized.includes('CREATE TABLE') || normalized.includes('CREATE INDEX')) {
    return makeResult([]);
  }

  return makeResult([]);
}

export function open() {
  return {
    execute: (sql: string, params: unknown[] = []) => runSql(sql, params),
  };
}

export function resetMockDatabase(): void {
  Object.keys(tables).forEach(key => {
    tables[key] = [];
  });
  transactionBackup = null;
}
