import { copyFileSync, cpSync, existsSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { getUserDataPath } from './user-data'

function legacyUserDataRoots() {
  const current = getUserDataPath()
  let appData = join(homedir(), 'Library', 'Application Support')
  if (process.versions.electron) {
    try {
      const electron = require('electron') as { app?: { getPath(name: 'appData'): string } }
      appData = electron.app?.getPath('appData') ?? appData
    } catch {
      // Use the macOS default above in server mode.
    }
  }
  return [join(appData, 'OtoDesk'), join(appData, 'otodesk')].filter((root) => root !== current)
}

function ensureParent(path: string) {
  mkdirSync(dirname(path), { recursive: true })
}

export function migrateLegacyDatabase(dbPath: string) {
  if (existsSync(dbPath)) return
  ensureParent(dbPath)

  for (const root of legacyUserDataRoots()) {
    const legacyDbPath = join(root, 'otodesk.sqlite')
    if (!existsSync(legacyDbPath)) continue

    for (const suffix of ['', '-wal', '-shm']) {
      const source = `${legacyDbPath}${suffix}`
      const target = `${dbPath}${suffix}`
      if (existsSync(source) && !existsSync(target)) copyFileSync(source, target)
    }
    return
  }
}

export function migrateLegacyProjects(projectsRoot: string) {
  if (existsSync(projectsRoot)) return
  ensureParent(projectsRoot)

  for (const root of legacyUserDataRoots()) {
    const legacyProjectsRoot = join(root, basename(projectsRoot))
    if (!existsSync(legacyProjectsRoot)) continue
    cpSync(legacyProjectsRoot, projectsRoot, { recursive: true, force: false })
    return
  }
}
