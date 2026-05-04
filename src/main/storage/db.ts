import { app } from 'electron'
import Database from 'better-sqlite3'
import { join } from 'node:path'
import { runMigrations } from './migrations'

let db: Database.Database | null = null

export function getDb() {
  if (!db) initializeDatabase()
  return db!
}

export function initializeDatabase() {
  if (db) return db

  const dbPath = join(app.getPath('userData'), 'otodesk.sqlite')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  runMigrations(db)
  return db
}
