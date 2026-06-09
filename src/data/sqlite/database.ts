import {open} from 'react-native-quick-sqlite';

import {MIGRATION_V001_SQL} from './migrations/v001';

const DB_NAME = 'quizgame.db';
const CURRENT_VERSION = 1;

let dbInstance: ReturnType<typeof open> | null = null;
let initialized = false;

export function getDb() {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return dbInstance;
}

function getSchemaVersion(): number {
  const db = getDb();
  db.execute('CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL)');
  const result = db.execute('SELECT version FROM schema_version LIMIT 1');
  if (result.rows && result.rows.length > 0) {
    return Number(result.rows.item(0).version);
  }
  return 0;
}

function runMigrationV001(): void {
  const db = getDb();
  db.execute(MIGRATION_V001_SQL);
  db.execute('DELETE FROM schema_version');
  db.execute('INSERT INTO schema_version (version) VALUES (?)', [CURRENT_VERSION]);
  console.log('DB migrated v001');
}

export async function initDatabase(): Promise<void> {
  if (initialized) {
    console.log('DB already initialized');
    return;
  }
  console.log('DB opening database...');
  dbInstance = open({name: DB_NAME});
  console.log('DB opened successfully');

  const version = getSchemaVersion();
  console.log('DB schema version:', version);
  if (version < CURRENT_VERSION) {
    console.log('DB running migration v001...');
    runMigrationV001();
    console.log('DB migration done');
  }

  initialized = true;
  console.log('DB initialized:', initialized);
}

export function resetDatabaseForTests(): void {
  initialized = false;
  dbInstance = null;
}
