import { app } from 'electron'
import Database from 'better-sqlite3'
import { join } from 'node:path'
import type { Track } from '@shared/types'

let db: Database.Database | null = null

export function getDb() {
  if (db) return db

  const dbPath = join(app.getPath('userData'), 'musedesk.sqlite')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS tracks (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      source_id TEXT NOT NULL,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT,
      cover_url TEXT,
      duration INTEGER NOT NULL DEFAULT 0,
      lyric TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(source, source_id)
    );

    CREATE TABLE IF NOT EXISTS song_analyses (
      id TEXT PRIMARY KEY,
      track_id TEXT NOT NULL,
      summary TEXT NOT NULL,
      mood_tags TEXT NOT NULL,
      genre_tags TEXT NOT NULL,
      lyric_themes TEXT NOT NULL,
      inspiration_points TEXT NOT NULL,
      avoid_points TEXT NOT NULL,
      recommended_themes TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inspirations (
      id TEXT PRIMARY KEY,
      track_id TEXT NOT NULL,
      analysis_id TEXT,
      title TEXT NOT NULL,
      note TEXT,
      mood_tags TEXT NOT NULL,
      genre_tags TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS creation_projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      source_inspiration_id TEXT,
      source_track_id TEXT,
      user_idea TEXT NOT NULL,
      directions TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `)

  return db
}

export function saveTrack(track: Track) {
  const database = getDb()
  database
    .prepare(
      `INSERT INTO tracks (id, source, source_id, title, artist, album, cover_url, duration, lyric, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(source, source_id) DO UPDATE SET
         id = excluded.id,
         source = excluded.source,
         source_id = excluded.source_id,
         title = excluded.title,
         artist = excluded.artist,
         album = excluded.album,
         cover_url = excluded.cover_url,
         duration = excluded.duration,
         lyric = excluded.lyric,
         tags = excluded.tags,
         created_at = excluded.created_at,
         updated_at = excluded.updated_at`
    )
    .run(
      track.id,
      track.source,
      track.sourceId,
      track.title,
      track.artist,
      track.album ?? null,
      track.coverUrl ?? null,
      track.duration,
      track.lyric ?? null,
      JSON.stringify(track.tags ?? []),
      track.createdAt,
      track.updatedAt
    )
}
