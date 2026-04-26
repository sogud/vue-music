import { NeteaseAdapter } from './netease-adapter'
import type { MusicProvider } from './music-provider'

export function getMusicProvider(): MusicProvider {
  return new NeteaseAdapter()
}
