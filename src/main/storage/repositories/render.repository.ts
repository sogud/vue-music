import type { RenderOutput } from '@shared/types'
import { pathToFileURL } from 'node:url'
import { getDb } from '../db'

type RenderOutputRow = {
  id: string
  project_id: string
  midi_path: string
  wav_path: string
  created_at: number
}

function mapRenderOutput(row: RenderOutputRow): RenderOutput {
  return {
    id: row.id,
    projectId: row.project_id,
    midiPath: row.midi_path,
    wavPath: row.wav_path,
    audioUrl: pathToFileURL(row.wav_path).toString(),
    createdAt: row.created_at
  }
}

export class RenderRepository {
  save(output: Omit<RenderOutput, 'audioUrl'>) {
    getDb()
      .prepare(
        `INSERT INTO render_outputs (id, project_id, midi_path, wav_path, created_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(output.id, output.projectId, output.midiPath, output.wavPath, output.createdAt)
    return this.getById(output.id)!
  }

  getById(id: string) {
    const row = getDb().prepare('SELECT * FROM render_outputs WHERE id = ?').get(id) as
      | RenderOutputRow
      | undefined
    return row ? mapRenderOutput(row) : null
  }

  listByProject(projectId: string) {
    const rows = getDb()
      .prepare('SELECT * FROM render_outputs WHERE project_id = ? ORDER BY created_at DESC')
      .all(projectId) as RenderOutputRow[]
    return rows.map(mapRenderOutput)
  }
}

export const renderRepository = new RenderRepository()
