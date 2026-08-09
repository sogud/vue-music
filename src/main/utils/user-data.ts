import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

function electronUserDataPath() {
  if (!process.versions.electron) return null
  try {
    const electron = require('electron') as { app?: { getPath(name: 'userData'): string } }
    return electron.app?.getPath('userData') ?? null
  } catch {
    return null
  }
}

export function getUserDataPath() {
  const explicit = process.env.OTO_USER_DATA_DIR || process.env.OTODESK_USER_DATA_DIR
  const root = explicit || electronUserDataPath() || join(homedir(), '.oto')
  mkdirSync(root, { recursive: true })
  return root
}
