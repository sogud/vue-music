import { defineStore } from 'pinia'
import type { MusicDiscovery, MusicList, SearchTrackResult, Track } from '@shared/types'
import { musicApi } from '../api/music.api'

export const useMusicStore = defineStore('music', {
  state: () => ({
    query: '',
    results: [] as SearchTrackResult[],
    discovery: null as MusicDiscovery | null,
    activeTracks: [] as SearchTrackResult[],
    activeListTitle: '推荐新歌',
    browseListTitle: '推荐新歌',
    currentTrack: null as Track | null,
    currentSourceId: null as string | null,
    lyric: null as string | null,
    playableUrl: null as string | null,
    playbackNonce: 0,
    loading: false,
    error: ''
  }),
  getters: {
    visibleTracks: (state) => (state.query ? state.results : state.activeTracks)
  },
  actions: {
    async loadDiscovery() {
      this.loading = true
      this.error = ''
      try {
        this.discovery = await musicApi.getDiscovery()
        if (!this.query) {
          this.activeTracks = this.discovery.newSongs
          this.activeListTitle = '推荐新歌'
          this.browseListTitle = '推荐新歌'
        }
      } catch {
        this.error = '音乐服务未连接，请确认 NeteaseCloudMusicApi 正在运行。'
      } finally {
        this.loading = false
      }
    },
    async search() {
      this.loading = true
      this.error = ''
      try {
        const trimmed = this.query.trim()
        this.results = await musicApi.searchTracks(this.query)
        this.activeListTitle = trimmed ? `搜索：${trimmed}` : this.browseListTitle
      } catch {
        this.error = '音乐服务未连接，请确认 NeteaseCloudMusicApi 正在运行。'
        this.results = []
      } finally {
        this.loading = false
      }
    },
    async openList(list: MusicList) {
      this.loading = true
      this.error = ''
      this.query = ''
      this.results = []
      this.activeListTitle = list.title
      this.browseListTitle = list.title
      try {
        this.activeTracks = await musicApi.getPlaylistTracks({ source: list.source, sourceId: list.sourceId })
      } catch (error) {
        this.error = error instanceof Error ? error.message : '无法加载歌单。'
        this.activeTracks = []
      } finally {
        this.loading = false
      }
    },
    showNewSongs() {
      this.query = ''
      this.results = []
      this.error = ''
      this.activeListTitle = '推荐新歌'
      this.browseListTitle = '推荐新歌'
      this.activeTracks = this.discovery?.newSongs ?? []
    },
    clearSearch() {
      this.query = ''
      this.results = []
      this.error = ''
      this.activeListTitle = this.browseListTitle
    },
    async selectTrack(result: SearchTrackResult) {
      this.loading = true
      this.error = ''
      this.playableUrl = null
      this.lyric = null
      this.currentSourceId = result.sourceId
      try {
        this.currentTrack = await musicApi.resolveTrack({ source: result.source, sourceId: result.sourceId })
        const [lyric, url] = await Promise.all([
          musicApi.getLyric(this.currentTrack.id).catch(() => null),
          musicApi.getPlayableUrl(this.currentTrack.id).catch(() => null)
        ])
        this.lyric = lyric
        this.playableUrl = url
        if (url) this.playbackNonce += 1
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error)
      } finally {
        this.loading = false
      }
    },
    async playNext() {
      const tracks = this.visibleTracks
      if (!tracks.length) return
      const currentIndex = tracks.findIndex((track) => track.sourceId === this.currentSourceId)
      const next = tracks[(currentIndex + 1 + tracks.length) % tracks.length]
      if (next) await this.selectTrack(next)
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
