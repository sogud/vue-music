import { randomUUID } from 'node:crypto'
import { getDb } from '../../db'
import { getAgentClient } from '../agent'
import { getAnalysisByTrack } from '../analysis/song-analysis-service'
import type { CreationProject, CreationDirection, CreateFromInspirationInput, CreateFromIdeaInput } from '@shared/types'

function parseDirections(value: string): CreationDirection[] {
  return JSON.parse(value) as CreationDirection[]
}

export async function createFromInspiration(input: CreateFromInspirationInput): Promise<CreationProject> {
  const db = getDb()
  const agent = getAgentClient()

  const inspirationRow = db.prepare('SELECT * FROM inspirations WHERE id = ?').get(input.inspirationId) as Record<string, string> | undefined
  if (!inspirationRow) {
    throw new Error('Inspiration not found')
  }

  const track = db.prepare('SELECT * FROM tracks WHERE id = ?').get(inspirationRow.track_id) as Record<string, string> | undefined
  const analysis = inspirationRow.analysis_id ? getAnalysisByTrack(inspirationRow.track_id) : null

  const agentOutput = await agent.generateCreationDirections({
    track: track ? {
      id: track.id,
      source: 'netease',
      sourceId: track.source_id,
      title: track.title,
      artist: track.artist,
      album: track.album ?? undefined,
      coverUrl: track.cover_url ?? undefined,
      duration: Number(track.duration),
      lyric: track.lyric ?? undefined,
      tags: JSON.parse(track.tags),
      createdAt: Number(track.created_at),
      updatedAt: Number(track.updated_at)
    } : undefined,
    analysis: analysis ?? undefined,
    userIdea: input.userIdea
  })
  const now = Date.now()

  const project: CreationProject = {
    id: randomUUID(),
    title: inspirationRow.title,
    sourceInspirationId: input.inspirationId,
    sourceTrackId: track?.id,
    userIdea: input.userIdea ?? '',
    directions: agentOutput.directions.map((direction) => ({
      ...direction,
      id: randomUUID()
    })),
    createdAt: now,
    updatedAt: now
  }

  db.prepare(
    `INSERT INTO creation_projects (id, title, source_inspiration_id, source_track_id, user_idea, directions, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    project.id,
    project.title,
    project.sourceInspirationId ?? null,
    project.sourceTrackId ?? null,
    project.userIdea,
    JSON.stringify(project.directions),
    project.createdAt,
    project.updatedAt
  )

  return project
}

export async function createFromIdea(input: CreateFromIdeaInput): Promise<CreationProject> {
  const db = getDb()
  const agent = getAgentClient()

  const agentOutput = await agent.generateCreationDirections({
    userIdea: input.userIdea
  })
  const now = Date.now()

  const project: CreationProject = {
    id: randomUUID(),
    title: input.userIdea.slice(0, 40),
    userIdea: input.userIdea,
    directions: agentOutput.directions.map((direction) => ({
      ...direction,
      id: randomUUID()
    })),
    createdAt: now,
    updatedAt: now
  }

  db.prepare(
    `INSERT INTO creation_projects (id, title, source_inspiration_id, source_track_id, user_idea, directions, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    project.id,
    project.title,
    null,
    null,
    project.userIdea,
    JSON.stringify(project.directions),
    project.createdAt,
    project.updatedAt
  )

  return project
}

export function listProjects(): CreationProject[] {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM creation_projects ORDER BY created_at DESC').all() as Array<Record<string, string>>
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    sourceInspirationId: row.source_inspiration_id ?? undefined,
    sourceTrackId: row.source_track_id ?? undefined,
    userIdea: row.user_idea,
    directions: parseDirections(row.directions),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at)
  }))
}

export function getProject(id: string): CreationProject | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM creation_projects WHERE id = ?').get(id) as Record<string, string> | undefined
  if (!row) return null

  return {
    id: row.id,
    title: row.title,
    sourceInspirationId: row.source_inspiration_id ?? undefined,
    sourceTrackId: row.source_track_id ?? undefined,
    userIdea: row.user_idea,
    directions: parseDirections(row.directions),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at)
  }
}
