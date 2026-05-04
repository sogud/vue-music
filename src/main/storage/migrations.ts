import type Database from 'better-sqlite3'

export function runMigrations(db: Database.Database) {
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
      creation_suggestions TEXT NOT NULL,
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

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      source_track_id TEXT,
      source_inspiration_id TEXT,
      user_idea TEXT,
      composition_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS render_outputs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      midi_path TEXT NOT NULL,
      wav_path TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `)
}
