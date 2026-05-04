import { access } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import type { RenderToolStatus } from '@shared/types'
import { settingsService } from '../settings/settings-service'

function canSpawn(command: string) {
  return new Promise<boolean>((resolve) => {
    const child = spawn(command, ['--version'], { stdio: 'ignore' })
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
    const fluidsynthPath = settingsService.getFluidSynthPath()
    const soundFontPath = settingsService.getSoundFontPath()
    const fluidsynthAvailable = !!fluidsynthPath && (await canSpawn(fluidsynthPath))
    const soundFontConfigured = !!soundFontPath && (await fileExists(soundFontPath))
    const canRender = fluidsynthAvailable && soundFontConfigured

    let message: string | undefined
    if (!fluidsynthAvailable) message = '未找到 FluidSynth，请安装或在设置中配置路径。'
    else if (!soundFontConfigured) message = '请先选择 .sf2 SoundFont 文件。'

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
