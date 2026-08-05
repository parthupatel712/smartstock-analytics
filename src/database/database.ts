import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "smartstock.db";

let databaseInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (databaseInstance) {
    return databaseInstance;
  }

  databaseInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await databaseInstance.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  return databaseInstance;
}