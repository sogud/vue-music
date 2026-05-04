import type { Inspiration } from '@shared/types'
import { getDb } from '../db'
import { parseJson } from '../../utils/json'

type InspirationRow = {
  id: string
  track_id: string
  analysis_id: string | null
  title: string
  note: string | null
  mood_tags: string
  genre_tags: string
  track_title?: string | null
  track_artist?: string | null
  created_at: number
  updated_at: number
}

function mapInspiration(row: InspirationRow): Inspiration {
  return {
    id: row.id,
    trackId: row.track_id,
    analysisId: row.analysis_id ?? undefined,
    title: row.title,
    note: row.note ?? undefined,
    moodTags: parseJson<string[]>(row.mood_tags),
    genreTags: parseJson<string[]>(row.genre_tags),
    trackTitle: row.track_title ?? undefined,
    trackArtist: row.track_artist ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export class InspirationRepository {
  save(inspiration: Inspiration) {
    getDb()
      .prepare(
        `INSERT INTO inspirations (
          id, track_id, analysis_id, title, note, mood_tags, genre_tags, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        inspiration.id,
        inspiration.trackId,
        inspiration.analysisId ?? null,
        inspiration.title,
        inspiration.note ?? null,
        JSON.stringify(inspiration.moodTags),
        JSON.stringify(inspiration.genreTags),
        inspiration.createdAt,
        inspiration.updatedAt
      )
    return inspiration
  }

  list() {
    const rows = getDb()
      .prepare(
        `SELECT inspirations.*, tracks.title AS track_title, tracks.artist AS track_artist
         FROM inspirations
         LEFT JOIN tracks ON tracks.id = inspirations.track_id
         ORDER BY inspirations.created_at DESC`
      )
      .all() as InspirationRow[]
    return rows.map(mapInspiration)
  }

  getById(id: string) {
    const row = getDb()
      .prepare(
        `SELECT inspirations.*, tracks.title AS track_title, tracks.artist AS track_artist
         FROM inspirations
         LEFT JOIN tracks ON tracks.id = inspirations.track_id
         WHERE inspirations.id = ?`
      )
      .get(id) as InspirationRow | undefined
    return row ? mapInspiration(row) : null
  }

  remove(id: string) {
    getDb().prepare('DELETE FROM inspirations WHERE id = ?').run(id)
  }
}

export const inspirationRepository = new InspirationRepository()
