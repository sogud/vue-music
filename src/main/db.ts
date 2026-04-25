import { app } from 'electron'
import Database from 'better-sqlite3'
import { join } from 'node:path'
import type { Song } from '@shared/types'

let db: Database.Database | null = null

export function getDb() {
  if (db) return db

  const dbPath = join(app.getPath('userData'), 'musedesk.sqlite')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT NOT NULL,
      cover_url TEXT NOT NULL,
      duration_sec INTEGER NOT NULL,
      tags_json TEXT NOT NULL,
      lyric_snippet TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      song_id TEXT NOT NULL,
      mood_json TEXT NOT NULL,
      style_json TEXT NOT NULL,
      structure_json TEXT NOT NULL,
      keywords_json TEXT NOT NULL,
      summary TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inspirations (
      id TEXT PRIMARY KEY,
      song_id TEXT NOT NULL,
      note TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS directions (
      id TEXT PRIMARY KEY,
      song_id TEXT NOT NULL,
      title TEXT NOT NULL,
      concept TEXT NOT NULL,
      prompt TEXT NOT NULL,
      keywords_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `)

  return db
}

export function saveSong(song: Song) {
  const database = getDb()
  database
    .prepare(
      `INSERT INTO songs (id, title, artist, album, cover_url, duration_sec, tags_json, lyric_snippet, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         artist = excluded.artist,
         album = excluded.album,
         cover_url = excluded.cover_url,
         duration_sec = excluded.duration_sec,
         tags_json = excluded.tags_json,
         lyric_snippet = excluded.lyric_snippet,
         updated_at = excluded.updated_at`
    )
    .run(
      song.id,
      song.title,
      song.artist,
      song.album,
      song.coverUrl,
      song.durationSec,
      JSON.stringify(song.tags),
      song.lyricSnippet,
      new Date().toISOString()
    )
}
