import type { Composition, Project } from '@shared/types'
import { getDb } from '../db'
import { parseJson } from '../../utils/json'

type ProjectRow = {
  id: string
  title: string
  description: string | null
  source_track_id: string | null
  source_inspiration_id: string | null
  user_idea: string | null
  composition_json: string
  created_at: number
  updated_at: number
}

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    sourceTrackId: row.source_track_id ?? undefined,
    sourceInspirationId: row.source_inspiration_id ?? undefined,
    userIdea: row.user_idea ?? undefined,
    composition: parseJson<Composition>(row.composition_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export class ProjectRepository {
  save(project: Project) {
    getDb()
      .prepare(
        `INSERT INTO projects (
          id, title, description, source_track_id, source_inspiration_id,
          user_idea, composition_json, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        project.id,
        project.title,
        project.description ?? null,
        project.sourceTrackId ?? null,
        project.sourceInspirationId ?? null,
        project.userIdea ?? null,
        JSON.stringify(project.composition, null, 2),
        project.createdAt,
        project.updatedAt
      )
    return project
  }

  list() {
    const rows = getDb().prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as ProjectRow[]
    return rows.map(mapProject)
  }

  getById(id: string) {
    const row = getDb().prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined
    return row ? mapProject(row) : null
  }

  updateComposition(id: string, composition: Composition) {
    const updatedAt = Date.now()
    getDb()
      .prepare(
        `UPDATE projects
         SET title = ?, description = ?, composition_json = ?, updated_at = ?
         WHERE id = ?`
      )
      .run(
        composition.title,
        composition.description ?? null,
        JSON.stringify(composition, null, 2),
        updatedAt,
        id
      )
    return this.getById(id)
  }

  remove(id: string) {
    getDb().prepare('DELETE FROM projects WHERE id = ?').run(id)
    getDb().prepare('DELETE FROM render_outputs WHERE project_id = ?').run(id)
  }
}

export const projectRepository = new ProjectRepository()
