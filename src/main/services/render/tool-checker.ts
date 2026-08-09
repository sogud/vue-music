import { access } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import type { RenderToolStatus } from '@shared/types'
import { settingsService } from '../settings/settings-service'
import { getBundledFluidSynthLibraryPath, getBundledFluidSynthPath, getBundledSoundFontPath } from '../../utils/resources'

export function getFluidSynthSpawnEnv() {
  const bundledLibPath = getBundledFluidSynthLibraryPath()
  if (!bundledLibPath) return process.env
  return {
    ...process.env,
    DYLD_LIBRARY_PATH: [bundledLibPath, process.env.DYLD_LIBRARY_PATH].filter(Boolean).join(':')
  }
}

function canSpawn(command: string) {
  return new Promise<boolean>((resolve) => {
    const child = spawn(command, ['--version'], { stdio: 'ignore', env: getFluidSynthSpawnEnv() })
    const timeout = setTimeout(() => {
      child.kill('SIGTERM')
      resolve(false)
    }, 5000)
    child.on('error', () => {
      clearTimeout(timeout)
      resolve(false)
    })
    child.on('close', (code) => {
      clearTimeout(timeout)
      resolve(code === 0)
    })
  })
}

async function fileExists(path: string) {
  if (!path) return false
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

export class ToolChecker {
  async checkRenderer(): Promise<RenderToolStatus> {
    const configuredFluidSynthPath = settingsService.getFluidSynthPath()
    const bundledFluidSynthPath = getBundledFluidSynthPath()
    const fluidSynthCandidates = Array.from(
      new Set([bundledFluidSynthPath, configuredFluidSynthPath].filter((value): value is string => !!value))
    )
    let fluidsynthPath = fluidSynthCandidates[0]
    let fluidsynthAvailable = false
    for (const candidate of fluidSynthCandidates) {
      if (await canSpawn(candidate)) {
        fluidsynthPath = candidate
        fluidsynthAvailable = true
        break
      }
    }

    const configuredSoundFontPath = settingsService.getSoundFontPath()
    const bundledSoundFontPath = getBundledSoundFontPath()
    const soundFontPath =
      bundledSoundFontPath && (await fileExists(bundledSoundFontPath))
        ? bundledSoundFontPath
        : configuredSoundFontPath
    const soundFontConfigured = !!soundFontPath && (await fileExists(soundFontPath))
    const canRender = fluidsynthAvailable && soundFontConfigured

    let message: string | undefined
    if (!fluidsynthAvailable) message = '未找到内置 FluidSynth，请重新安装 oto 或在设置中配置自定义路径。'
    else if (!soundFontConfigured) message = '未找到内置 SoundFont，请重新安装 oto。'

    return {
      fluidsynthAvailable,
      fluidsynthPath,
      soundFontConfigured,
      soundFontPath,
      canRender,
      message
    }
  }
}

export const toolChecker = new ToolChecker()
