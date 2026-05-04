import type { Track } from '@shared/types'
import { getDb } from '../db'

type TrackRow = {
  id: string
  source: Track['source']
  source_id: string
  title: string
  artist: string
  album: string | null
  cover_url: string | null
  duration: number
  lyric: string | null
  created_at: number
  updated_at: number
}

function mapTrack(row: TrackRow): Track {
  return {
    id: row.id,
    source: row.source,
    sourceId: row.source_id,
    title: row.title,
    artist: row.artist,
    album: row.album ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    duration: row.duration,
    lyric: row.lyric ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export class TrackRepository {
  upsert(track: Track) {
    getDb()
      .prepare(
        `INSERT INTO tracks (id, source, source_id, title, artist, album, cover_url, duration, lyric, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(source, source_id) DO UPDATE SET
           title = excluded.title,
           artist = excluded.artist,
           album = excluded.album,
           cover_url = excluded.cover_url,
           duration = excluded.duration,
           lyric = COALESCE(excluded.lyric, tracks.lyric),
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
        track.createdAt,
        track.updatedAt
      )

    return this.getBySource(track.source, track.sourceId) ?? track
  }

  getById(id: string) {
    const row = getDb().prepare('SELECT * FROM tracks WHERE id = ?').get(id) as TrackRow | undefined
    return row ? mapTrack(row) : null
  }

  getBySource(source: Track['source'], sourceId: string) {
    const row = getDb()
      .prepare('SELECT * FROM tracks WHERE source = ? AND source_id = ?')
      .get(source, sourceId) as TrackRow | undefined
    return row ? mapTrack(row) : null
  }

  updateLyric(id: string, lyric: string) {
    getDb().prepare('UPDATE tracks SET lyric = ?, updated_at = ? WHERE id = ?').run(lyric, Date.now(), id)
    return this.getById(id)
  }
}

export const trackRepository = new TrackRepository()
