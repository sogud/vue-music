import type { CreationSuggestion, SongAnalysis } from '@shared/types'
import { getDb } from '../db'
import { parseJson } from '../../utils/json'

type AnalysisRow = {
  id: string
  track_id: string
  summary: string
  mood_tags: string
  genre_tags: string
  lyric_themes: string
  inspiration_points: string
  avoid_points: string
  creation_suggestions: string
  created_at: number
  updated_at: number
}

function mapAnalysis(row: AnalysisRow): SongAnalysis {
  return {
    id: row.id,
    trackId: row.track_id,
    summary: row.summary,
    moodTags: parseJson<string[]>(row.mood_tags),
    genreTags: parseJson<string[]>(row.genre_tags),
    lyricThemes: parseJson<string[]>(row.lyric_themes),
    inspirationPoints: parseJson<string[]>(row.inspiration_points),
    avoidPoints: parseJson<string[]>(row.avoid_points),
    creationSuggestions: parseJson<CreationSuggestion[]>(row.creation_suggestions),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export class AnalysisRepository {
  save(analysis: SongAnalysis) {
    getDb()
      .prepare(
        `INSERT INTO song_analyses (
          id, track_id, summary, mood_tags, genre_tags, lyric_themes,
          inspiration_points, avoid_points, creation_suggestions, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        analysis.id,
        analysis.trackId,
        analysis.summary,
        JSON.stringify(analysis.moodTags),
        JSON.stringify(analysis.genreTags),
        JSON.stringify(analysis.lyricThemes),
        JSON.stringify(analysis.inspirationPoints),
        JSON.stringify(analysis.avoidPoints),
        JSON.stringify(analysis.creationSuggestions),
        analysis.createdAt,
        analysis.updatedAt
      )
    return analysis
  }

  getByTrack(trackId: string) {
    const row = getDb()
      .prepare('SELECT * FROM song_analyses WHERE track_id = ? ORDER BY created_at DESC LIMIT 1')
      .get(trackId) as AnalysisRow | undefined
    return row ? mapAnalysis(row) : null
  }

  getById(id: string) {
    const row = getDb().prepare('SELECT * FROM song_analyses WHERE id = ?').get(id) as AnalysisRow | undefined
    return row ? mapAnalysis(row) : null
  }
}

export const analysisRepository = new AnalysisRepository()
