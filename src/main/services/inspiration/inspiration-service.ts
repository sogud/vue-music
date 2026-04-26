import { randomUUID } from 'node:crypto'
import { getDb } from '../../db'
import { getAnalysisByTrack } from '../analysis/song-analysis-service'
import type { Inspiration, SaveInspirationInput } from '@shared/types'

function parseJsonArray(value: string): string[] {
  return JSON.parse(value) as string[]
}

export function saveInspiration(input: SaveInspirationInput): Inspiration {
  const db = getDb()

  const trackRow = db.prepare('SELECT * FROM tracks WHERE id = ?').get(input.trackId) as Record<string, string> | undefined
  if (!trackRow) {
    throw new Error('Track not found')
  }

  const analysis = input.analysisId ? getAnalysisByTrack(input.trackId) : null

  const moodTags = analysis?.moodTags ?? parseJsonArray(trackRow.tags ?? '[]')
  const genreTags = analysis?.genreTags ?? []

  const inspiration: Inspiration = {
    id: randomUUID(),
    trackId: input.trackId,
    analysisId: input.analysisId,
    title: trackRow.title,
    note: input.note ?? undefined,
    moodTags,
    genreTags,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  db.prepare(
    `INSERT INTO inspirations (id, track_id, analysis_id, title, note, mood_tags, genre_tags, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
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

export function listInspirations(): Inspiration[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM inspirations ORDER BY created_at DESC').all() as Array<Record<string, string>>
  return rows.map((row) => ({
    id: row.id,
    trackId: row.track_id,
    analysisId: row.analysis_id ?? undefined,
    title: row.title,
    note: row.note ?? undefined,
    moodTags: parseJsonArray(row.mood_tags),
    genreTags: parseJsonArray(row.genre_tags),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at)
  }))
}

export function removeInspiration(id: string): void {
  const db = getDb()
  db.prepare('DELETE FROM inspirations WHERE id = ?').run(id)
}
