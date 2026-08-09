import Database from 'better-sqlite3'
import { join } from 'node:path'
import { runMigrations } from './migrations'
import { migrateLegacyDatabase } from '../utils/legacy-data'
import { getUserDataPath } from '../utils/user-data'

let db: Database.Database | null = null

export function getDb() {
  if (!db) initializeDatabase()
  return db!
}

export function initializeDatabase() {
  if (db) return db

  const dbPath = join(getUserDataPath(), 'oto.sqlite')
  migrateLegacyDatabase(dbPath)
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  runMigrations(db)
  return db
}
