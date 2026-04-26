import { randomUUID } from 'node:crypto'
import { getDb } from '../../db'
import { getAgentClient } from '../agent'
import { getMusicProvider } from '../music-provider'
import type { SongAnalysis, AnalyzeTrackInput, CreationTheme } from '@shared/types'

function parseJsonArray(value: string): string[] {
  return JSON.parse(value) as string[]
}

function parseThemes(value: string): CreationTheme[] {
  return JSON.parse(value) as CreationTheme[]
}

export async function analyzeTrack(input: AnalyzeTrackInput): Promise<SongAnalysis> {
  const db = getDb()
  const agent = getAgentClient()
  const musicProvider = getMusicProvider()

  const trackRow = db.prepare('SELECT * FROM tracks WHERE id = ?').get(input.trackId) as Record<string, unknown> | undefined
  if (!trackRow) {
    throw new Error('Track not found')
  }

  // Fetch lyric if not already stored
  let lyric = trackRow.lyric as string | null
  if (!lyric) {
    try {
      lyric = await musicProvider.getLyric(trackRow.source_id as string)
      if (lyric) {
        db.prepare('UPDATE tracks SET lyric = ? WHERE id = ?').run(lyric, input.trackId)
      }
    } catch {
      // lyric fetch is best-effort
    }
  }

  const agentOutput = await agent.analyzeSong({
    title: trackRow.title as string,
    artist: trackRow.artist as string,
    lyric: lyric ?? undefined,
    userNote: input.userNote
  })

  const now = Date.now()

  const analysis: SongAnalysis = {
    id: randomUUID(),
    trackId: input.trackId,
    summary: agentOutput.summary,
    moodTags: agentOutput.moodTags,
    genreTags: agentOutput.genreTags,
    lyricThemes: agentOutput.lyricThemes,
    inspirationPoints: agentOutput.inspirationPoints,
    avoidPoints: agentOutput.avoidPoints,
    recommendedThemes: agentOutput.recommendedThemes.map((theme) => ({
      ...theme,
      id: randomUUID()
    })),
    createdAt: now,
    updatedAt: now
  }

  db.prepare(
    `INSERT INTO song_analyses (id, track_id, summary, mood_tags, genre_tags, lyric_themes, inspiration_points, avoid_points, recommended_themes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    analysis.id,
    analysis.trackId,
    analysis.summary,
    JSON.stringify(analysis.moodTags),
    JSON.stringify(analysis.genreTags),
    JSON.stringify(analysis.lyricThemes),
    JSON.stringify(analysis.inspirationPoints),
    JSON.stringify(analysis.avoidPoints),
    JSON.stringify(analysis.recommendedThemes),
    analysis.createdAt,
    analysis.updatedAt
  )

  return analysis
}

export function getAnalysisByTrack(trackId: string): SongAnalysis | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM song_analyses WHERE track_id = ? ORDER BY created_at DESC LIMIT 1').get(trackId) as Record<string, string> | undefined
  if (!row) return null

  return {
    id: row.id,
    trackId: row.track_id,
    summary: row.summary,
    moodTags: parseJsonArray(row.mood_tags),
    genreTags: parseJsonArray(row.genre_tags),
    lyricThemes: parseJsonArray(row.lyric_themes),
    inspirationPoints: parseJsonArray(row.inspiration_points),
    avoidPoints: parseJsonArray(row.avoid_points),
    recommendedThemes: parseThemes(row.recommended_themes),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at)
  }
}

export function listAnalyses(): SongAnalysis[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM song_analyses ORDER BY created_at DESC').all() as Array<Record<string, string>>
  return rows.map((row) => ({
    id: row.id,
    trackId: row.track_id,
    summary: row.summary,
    moodTags: parseJsonArray(row.mood_tags),
    genreTags: parseJsonArray(row.genre_tags),
    lyricThemes: parseJsonArray(row.lyric_themes),
    inspirationPoints: parseJsonArray(row.inspiration_points),
    avoidPoints: parseJsonArray(row.avoid_points),
    recommendedThemes: parseThemes(row.recommended_themes),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at)
  }))
}
