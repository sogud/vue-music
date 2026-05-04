import type { SearchTrackResult, Track } from '@shared/types'
import { createId } from '../../utils/ids'
import { settingsService } from '../settings/settings-service'
import type { MusicProvider } from './music-provider'

type NeteaseSearchResponse = {
  result?: {
    songs?: NeteaseSongLike[]
  }
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
