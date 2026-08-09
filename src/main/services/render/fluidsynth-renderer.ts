import { access } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { getFluidSynthSpawnEnv, toolChecker } from './tool-checker'
import { summarizeStderr } from '../../utils/errors'

export class FluidSynthRenderer {
  async render(midiPath: string, wavPath: string) {
    const status = await toolChecker.checkRenderer()
    if (!status.fluidsynthAvailable) throw new Error('未找到内置 FluidSynth，请重新安装 oto 或在设置中配置自定义路径。')
    if (!status.soundFontConfigured || !status.soundFontPath) throw new Error('未找到内置 SoundFont，请重新安装 oto。')

    await access(status.soundFontPath)
    await this.spawnFluidSynth(status.fluidsynthPath!, ['-ni', '-T', 'wav', '-F', wavPath, status.soundFontPath, midiPath])
    return wavPath
  }

  private spawnFluidSynth(command: string, args: string[]) {
    return new Promise<void>((resolve, reject) => {
      const child = spawn(command, args, { stdio: ['ignore', 'ignore', 'pipe'], env: getFluidSynthSpawnEnv() })
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
