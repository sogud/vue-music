import { app } from 'electron'
import { mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

export function getProjectsRoot() {
  const root = join(app.getPath('userData'), 'projects')
  mkdirSync(root, { recursive: true })
  return root
}

export function getProjectDir(projectId: string) {
  if (projectId.includes('/') || projectId.includes('\\') || projectId.includes('..')) {
    throw new Error('Invalid project id')
  }
  const root = getProjectsRoot()
  const dir = resolve(root, projectId)
  if (!dir.startsWith(root)) {
    throw new Error('Invalid project path')
  }
  mkdirSync(dir, { recursive: true })
  return dir
}

export function getProjectPaths(projectId: string) {
  const dir = getProjectDir(projectId)
  return {
    dir,
    compositionPath: join(dir, 'composition.json'),
    midiPath: join(dir, 'song.mid'),
    wavPath: join(dir, 'render.wav'),
    metadataPath: join(dir, 'metadata.json')
  }
}
