import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

function resourceRoot() {
  try {
    const electron = require('electron') as {
      app?: {
        isPackaged?: boolean
        getAppPath?(): string
      }
    }
    const app = electron.app
    if (app?.isPackaged) return process.resourcesPath
    const appPath = app?.getAppPath?.()
    if (appPath) return join(appPath, 'resources')
  } catch {
    // Running in the standalone web server, not Electron main.
  }
  return resolve(process.cwd(), 'resources')
}

export function getBundledResourcePath(...segments: string[]) {
  return join(resourceRoot(), ...segments)
}

export function getBundledSoundFontPath() {
  const path = getBundledResourcePath('soundfonts', 'VintageDreamsWaves-v2.sf2')
  return existsSync(path) ? path : undefined
}

export function getBundledFluidSynthPath() {
  const executable = process.platform === 'win32' ? 'fluidsynth.exe' : 'fluidsynth'
  const path = getBundledResourcePath('bin', `${process.platform}-${process.arch}`, executable)
  return existsSync(path) ? path : undefined
}

export function getBundledFluidSynthLibraryPath() {
  const path = getBundledResourcePath('bin', `${process.platform}-${process.arch}`, 'lib')
  return existsSync(path) ? path : undefined
}
