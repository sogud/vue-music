import type { MusicDiscovery, MusicList, SearchTrackResult, Track } from '@shared/types'
import { createId } from '../../utils/ids'
import { settingsService } from '../settings/settings-service'
import type { MusicProvider } from './music-provider'

type NeteaseSearchResponse = {
  result?: {
    songs?: NeteaseSongLike[]
  }
}

type NeteaseNewSongResponse = {
  result?: Array<{
    id?: number | string
    name?: string
    picUrl?: string
    song?: NeteaseSongLike
  }>
}

type NeteasePlaylistResponse = {
  playlists?: NeteasePlaylistLike[]
}

type NeteaseToplistResponse = {
  list?: NeteasePlaylistLike[]
}

type NeteasePlaylistDetailResponse = {
  playlist?: {
    tracks?: NeteaseSongLike[]
  }
}

type NeteaseHotSearchResponse = {
  data?: Array<{
    searchWord?: string
  }>
}

type NeteaseDetailResponse = {
  songs?: NeteaseSongLike[]
}

type NeteaseLyricResponse = {
  lrc?: {
    lyric?: string
  }
}

type NeteaseUrlResponse = {
  data?: Array<{
    url?: string | null
  }>
}

type NeteaseSongLike = {
  id: number | string
  name: string
  artists?: Array<{ name: string }>
  ar?: Array<{ name: string }>
  album?: { name?: string; picUrl?: string }
  al?: { name?: string; picUrl?: string }
  duration?: number
  dt?: number
}

type NeteasePlaylistLike = {
  id: number | string
  name: string
  coverImgUrl?: string
  picUrl?: string
  description?: string
  trackCount?: number
  playCount?: number
  updateFrequency?: string
}

function makeUrl(baseUrl: string, path: string, params: Record<string, string | number>) {
  const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value))
  }
  return url.toString()
}

function artistsOf(song: NeteaseSongLike) {
  return (song.ar ?? song.artists ?? []).map((artist) => artist.name).filter(Boolean).join(' / ')
}

function albumOf(song: NeteaseSongLike) {
  return song.al ?? song.album
}

function durationOf(song: NeteaseSongLike) {
  return Math.floor((song.dt ?? song.duration ?? 0) / 1000)
}

function mapSearchResult(song: NeteaseSongLike): SearchTrackResult {
  const album = albumOf(song)
  return {
    source: 'netease',
    sourceId: String(song.id),
    title: song.name,
    artist: artistsOf(song),
    album: album?.name,
    coverUrl: album?.picUrl,
    duration: durationOf(song)
  }
}

function mapNewSong(item: NonNullable<NeteaseNewSongResponse['result']>[number]): SearchTrackResult | null {
  if (item.song) return mapSearchResult(item.song)
  if (!item.id || !item.name) return null
  return {
    source: 'netease',
    sourceId: String(item.id),
    title: item.name,
    artist: '',
    coverUrl: item.picUrl,
    duration: 0
  }
}

function mapPlaylist(list: NeteasePlaylistLike): MusicList {
  return {
    source: 'netease',
    sourceId: String(list.id),
    title: list.name,
    coverUrl: list.coverImgUrl ?? list.picUrl,
    description: list.updateFrequency ?? list.description,
    trackCount: list.trackCount,
    playCount: list.playCount,
    updateFrequency: list.updateFrequency
  }
}

function mapTrack(song: NeteaseSongLike): Track {
  const now = Date.now()
  const base = mapSearchResult(song)
  return {
    ...base,
    id: createId(),
    createdAt: now,
    updatedAt: now
  }
}

async function getJson<T>(url: string, timeoutMs = 10000): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`Netease request failed: ${response.status} ${response.statusText}`)
    }
    return (await response.json()) as T
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('音乐服务响应超时，请确认 NeteaseCloudMusicApi 可访问。')
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export class NeteaseProvider implements MusicProvider {
  private get baseUrl() {
    return settingsService.getNeteaseBaseUrl()
  }

  async searchTracks(query: string): Promise<SearchTrackResult[]> {
    const trimmed = query.trim()
    if (!trimmed) return []

    const data = await getJson<NeteaseSearchResponse>(
      makeUrl(this.baseUrl, '/search', { keywords: trimmed, type: 1, limit: 20 })
    )
    return (data.result?.songs ?? []).map(mapSearchResult)
  }

  async getDiscovery(): Promise<MusicDiscovery> {
    const settled = await Promise.allSettled([
      getJson<NeteaseNewSongResponse>(makeUrl(this.baseUrl, '/personalized/newsong', { limit: 18 })),
      getJson<NeteasePlaylistResponse>(makeUrl(this.baseUrl, '/top/playlist', { limit: 12, cat: '全部' })),
      getJson<NeteaseToplistResponse>(makeUrl(this.baseUrl, '/toplist/detail', {})),
      getJson<NeteaseHotSearchResponse>(makeUrl(this.baseUrl, '/search/hot/detail', {}))
    ])
    if (settled.every((result) => result.status === 'rejected')) {
      throw new Error('音乐服务未连接，请确认 NeteaseCloudMusicApi 正在运行。')
    }

    const newSongs =
      settled[0].status === 'fulfilled' ? settled[0].value : ({ result: [] } satisfies NeteaseNewSongResponse)
    const playlists =
      settled[1].status === 'fulfilled' ? settled[1].value : ({ playlists: [] } satisfies NeteasePlaylistResponse)
    const charts = settled[2].status === 'fulfilled' ? settled[2].value : ({ list: [] } satisfies NeteaseToplistResponse)
    const hotSearches =
      settled[3].status === 'fulfilled' ? settled[3].value : ({ data: [] } satisfies NeteaseHotSearchResponse)

    return {
      newSongs: (newSongs.result ?? []).map(mapNewSong).filter((song): song is SearchTrackResult => Boolean(song)),
      playlists: (playlists.playlists ?? []).map(mapPlaylist),
      charts: (charts.list ?? []).slice(0, 10).map(mapPlaylist),
      hotSearches: (hotSearches.data ?? [])
        .map((item) => item.searchWord)
        .filter((word): word is string => Boolean(word))
        .slice(0, 10)
    }
  }

  async getPlaylistTracks(sourceId: string): Promise<SearchTrackResult[]> {
    const data = await getJson<NeteasePlaylistDetailResponse>(makeUrl(this.baseUrl, '/playlist/detail', { id: sourceId }))
    return (data.playlist?.tracks ?? []).map(mapSearchResult)
  }

  async getTrackDetail(sourceId: string): Promise<Track> {
    const data = await getJson<NeteaseDetailResponse>(makeUrl(this.baseUrl, '/song/detail', { ids: sourceId }))
    const song = data.songs?.[0]
    if (!song) throw new Error('Track not found')
    return mapTrack(song)
  }

  async getLyric(sourceId: string): Promise<string | null> {
    const data = await getJson<NeteaseLyricResponse>(makeUrl(this.baseUrl, '/lyric', { id: sourceId }))
    const lyric = data.lrc?.lyric
    return typeof lyric === 'string' && lyric.trim() ? lyric : null
  }

  async getPlayableUrl(sourceId: string): Promise<string | null> {
    const data = await getJson<NeteaseUrlResponse>(makeUrl(this.baseUrl, '/song/url', { id: sourceId }))
    const url = data.data?.[0]?.url
    return typeof url === 'string' && url.trim() ? url : null
  }
}
