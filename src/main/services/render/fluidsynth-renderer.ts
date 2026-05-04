import { access } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { settingsService } from '../settings/settings-service'
import { toolChecker } from './tool-checker'
import { summarizeStderr } from '../../utils/errors'

export class FluidSynthRenderer {
  async render(midiPath: string, wavPath: string) {
    const status = await toolChecker.checkRenderer()
    if (!status.fluidsynthAvailable) throw new Error('未找到 FluidSynth，请安装或在设置中配置路径。')
    if (!status.soundFontConfigured || !status.soundFontPath) throw new Error('请先选择 .sf2 SoundFont 文件。')

    await access(status.soundFontPath)
    const fluidsynthPath = settingsService.getFluidSynthPath()
    await this.spawnFluidSynth(fluidsynthPath, ['-ni', '-T', 'wav', '-F', wavPath, status.soundFontPath, midiPath])
    return wavPath
  }

  private spawnFluidSynth(command: string, args: string[]) {
    return new Promise<void>((resolve, reject) => {
      const child = spawn(command, args, { stdio: ['ignore', 'ignore', 'pipe'] })
      let stderr = ''

      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString()
      })
      child.on('error', reject)
      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`渲染失败：${summarizeStderr(stderr) || `FluidSynth exited with code ${code}`}`))
          return
        }
        resolve()
      })
    })
  }
}

export const fluidSynthRenderer = new FluidSynthRenderer()
