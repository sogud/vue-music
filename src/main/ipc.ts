import { ipcMain } from 'electron'
import { randomUUID } from 'node:crypto'
import { getDb, saveSong } from './db'
import { getNowPlayingSong } from './services/netease-adapter'
import { analyzeSong } from './services/agent'
import type { AnalyzeResult, CreationDirection, HomeSnapshot, Inspiration, Song, SongAnalysis } from '@shared/types'

function parseJsonArray<T>(value: string): T[] {
  return JSON.parse(value) as T[]
}

async function resolveSong(): Promise<Song> {
  const song = await getNowPlayingSong()
  saveSong(song)
  return song
}

export function registerIpcHandlers() {
  ipcMain.handle('musedesk:getHomeSnapshot', async () => {
    const db = getDb()
    const song = await resolveSong()

    const latestAnalysisRow = db
      .prepare('SELECT * FROM analyses WHERE song_id = ? ORDER BY created_at DESC LIMIT 1')
      .get(song.id) as Record<string, string> | undefined

    const directionRows = db
      .prepare('SELECT * FROM directions WHERE song_id = ? ORDER BY created_at DESC LIMIT 5')
      .all(song.id) as Array<Record<string, string>>

    const inspirationRows = db
      .prepare('SELECT * FROM inspirations WHERE song_id = ? ORDER BY created_at DESC LIMIT 5')
      .all(song.id) as Array<Record<string, string>>

    const latestAnalysis: SongAnalysis | null = latestAnalysisRow
      ? {
          id: latestAnalysisRow.id,
          songId: latestAnalysisRow.song_id,
          mood: parseJsonArray(latestAnalysisRow.mood_json),
          style: parseJsonArray(latestAnalysisRow.style_json),
          structure: parseJsonArray(latestAnalysisRow.structure_json),
          keywords: parseJsonArray(latestAnalysisRow.keywords_json),
          summary: latestAnalysisRow.summary,
          createdAt: latestAnalysisRow.created_at
        }
      : null

    const directions: CreationDirection[] = directionRows.map((row) => ({
      id: row.id,
      songId: row.song_id,
      title: row.title,
      concept: row.concept,
      prompt: row.prompt,
      keywords: parseJsonArray(row.keywords_json),
      createdAt: row.created_at
    }))

    const inspirations: Inspiration[] = inspirationRows.map((row) => ({
      id: row.id,
      songId: row.song_id,
      note: row.note,
      createdAt: row.created_at
    }))

    const snapshot: HomeSnapshot = {
      song,
      latestAnalysis,
      directions,
      inspirations
    }

    return snapshot
  })

  ipcMain.handle('musedesk:analyzeCurrentSong', async () => {
    const db = getDb()
    const song = await resolveSong()
    const payload = await analyzeSong(song)

    const analysis: SongAnalysis = {
      id: randomUUID(),
      songId: song.id,
      mood: payload.mood,
      style: payload.style,
      structure: payload.structure,
      keywords: payload.keywords,
      summary: payload.summary,
      createdAt: new Date().toISOString()
    }

    db.prepare(
      `INSERT INTO analyses (id, song_id, mood_json, style_json, structure_json, keywords_json, summary, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      analysis.id,
      analysis.songId,
      JSON.stringify(analysis.mood),
      JSON.stringify(analysis.style),
      JSON.stringify(analysis.structure),
      JSON.stringify(analysis.keywords),
      analysis.summary,
      analysis.createdAt
    )

    const result: AnalyzeResult = {
      analysis,
      recommendedThemes: payload.recommendedThemes
    }

    return result
  })

  ipcMain.handle('musedesk:saveInspiration', async (_event, note: string) => {
    const db = getDb()
    const song = await resolveSong()
    const inspiration: Inspiration = {
      id: randomUUID(),
      songId: song.id,
      note,
      createdAt: new Date().toISOString()
    }

    db.prepare('INSERT INTO inspirations (id, song_id, note, created_at) VALUES (?, ?, ?, ?)').run(
      inspiration.id,
      inspiration.songId,
      inspiration.note,
      inspiration.createdAt
    )

    return inspiration
  })

  ipcMain.handle('musedesk:generateDirection', async () => {
    const db = getDb()
    const song = await resolveSong()
    const direction: CreationDirection = {
      id: randomUUID(),
      songId: song.id,
      title: '海风里的告白草图',
      concept: '以木吉他与轻合成器铺底，构建“克制但有温度”的日系流行短歌。',
      prompt: 'BPM 92，Key D major，前奏 4 小节环境氛围，主歌保持留白，副歌加入轻和声。',
      keywords: ['夏末', '留白', '温柔女声', '胶片感'],
      createdAt: new Date().toISOString()
    }

    db.prepare(
      'INSERT INTO directions (id, song_id, title, concept, prompt, keywords_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      direction.id,
      direction.songId,
      direction.title,
      direction.concept,
      direction.prompt,
      JSON.stringify(direction.keywords),
      direction.createdAt
    )

    return direction
  })
}
