import type { SearchTrackResult, Track, TrackSource } from '@shared/types'
import { trackRepository } from '../../storage/repositories/track.repository'
import { NeteaseProvider } from './netease-provider'

export class MusicService {
  private readonly netease = new NeteaseProvider()

  async searchTracks(query: string): Promise<SearchTrackResult[]> {
    return this.netease.searchTracks(query)
  }

  async getDiscovery() {
    return this.netease.getDiscovery()
  }

  async getPlaylistTracks(input: { source: TrackSource; sourceId: string }) {
    if (input.source !== 'netease') throw new Error(`Unsupported music source: ${input.source}`)
    return this.netease.getPlaylistTracks(input.sourceId)
  }

  async resolveTrack(input: { source: TrackSource; sourceId: string }): Promise<Track> {
    if (input.source !== 'netease') throw new Error(`Unsupported music source: ${input.source}`)
    const detail = await this.netease.getTrackDetail(input.sourceId)
    return trackRepository.upsert(detail)
  }

  async getLyric(trackId: string): Promise<string | null> {
    const track = this.requireTrack(trackId)
    if (track.lyric) return track.lyric
    const lyric = await this.netease.getLyric(track.sourceId)
    if (lyric) trackRepository.updateLyric(track.id, lyric)
    return lyric
  }

  async getPlayableUrl(trackId: string): Promise<string | null> {
    const track = this.requireTrack(trackId)
    return this.netease.getPlayableUrl(track.sourceId)
  }

  async testNetease() {
    try {
      await this.searchTracks('test')
      return { ok: true, message: 'NeteaseCloudMusicApi 连接正常。' }
    } catch (error) {
      return {
        ok: false,
        message: '音乐服务未连接，请确认 NeteaseCloudMusicApi 正在运行。'
      }
    }
  }

  private requireTrack(trackId: string) {
    const track = trackRepository.getById(trackId)
    if (!track) throw new Error('Track not found')
    return track
  }
}

export const musicService = new MusicService()
