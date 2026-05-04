import { defineStore } from 'pinia'
import type { SearchTrackResult, Track } from '@shared/types'
import { musicApi } from '../api/music.api'

export const useMusicStore = defineStore('music', {
  state: () => ({
    query: '',
    results: [] as SearchTrackResult[],
    currentTrack: null as Track | null,
    lyric: null as string | null,
    playableUrl: null as string | null,
    loading: false,
    error: ''
  }),
  actions: {
    async search() {
      this.loading = true
      this.error = ''
      try {
        this.results = await musicApi.searchTracks(this.query)
      } catch {
        this.error = '音乐服务未连接，请确认 NeteaseCloudMusicApi 正在运行。'
        this.results = []
      } finally {
        this.loading = false
      }
    },
    async selectTrack(result: SearchTrackResult) {
      this.loading = true
      this.error = ''
      this.playableUrl = null
      this.lyric = null
      try {
        this.currentTrack = await musicApi.resolveTrack({ source: result.source, sourceId: result.sourceId })
        const [lyric, url] = await Promise.all([
          musicApi.getLyric(this.currentTrack.id).catch(() => null),
          musicApi.getPlayableUrl(this.currentTrack.id).catch(() => null)
        ])
        this.lyric = lyric
        this.playableUrl = url
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error)
      } finally {
        this.loading = false
      }
    },
    async refreshLyric() {
      if (!this.currentTrack) return
      this.lyric = await musicApi.getLyric(this.currentTrack.id)
    },
    async refreshPlayableUrl() {
      if (!this.currentTrack) return
      this.playableUrl = await musicApi.getPlayableUrl(this.currentTrack.id)
    }
  }
})
