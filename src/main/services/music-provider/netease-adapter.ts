import axios from 'axios'
import { appConfig } from '../../config'
import type { MusicProvider } from './music-provider'
import type { SearchTrackResult, Track } from '@shared/types'
import { randomUUID } from 'node:crypto'
import { getSetting } from '../settings/settings-service'

class MusicProviderError extends Error {}

interface NeteaseSearchResponse {
  result?: {
    songs?: Array<{
      id: number
      name: string
      artists?: Array<{ name: string }>
      ar?: Array<{ name: string }>
      album?: { name: string; picUrl?: string }
      al?: { name: string; picUrl?: string }
      duration?: number
      dt?: number
    }>
  }
}

interface NeteaseSongResponse {
  songs?: Array<{
    id: number
    name: string
    ar: Array<{ name: string }>
    al: { name: string; picUrl: string }
    dt: number
  }>
}

interface NeteaseLyricResponse {
  lrc?: { lyric?: string }
}

interface NeteaseUrlResponse {
  data?: Array<{ url?: string }>
}

function mapNeteaseSong(song: {
  id: number
  name: string
  ar?: Array<{ name: string }>
  artists?: Array<{ name: string }>
  al?: { name: string; picUrl?: string }
  album?: { name: string; picUrl?: string }
  dt?: number
  duration?: number
}): Track {
  const now = Date.now()
  const artists = song.ar ?? song.artists ?? []
  const album = song.al ?? song.album
  return {
    id: randomUUID(),
    source: 'netease',
    sourceId: String(song.id),
    title: song.name,
    artist: artists.map((a) => a.name).join(' / '),
    album: album?.name,
    coverUrl: album?.picUrl,
    duration: Math.floor(((song.dt ?? song.duration) ?? 0) / 1000),
    tags: [],
    createdAt: now,
    updatedAt: now
  }
}

export class NeteaseAdapter implements MusicProvider {
  private get baseUrl() {
    return getSetting('music.netease.baseUrl') ?? appConfig.neteaseBaseUrl
  }

  async searchTracks(query: string): Promise<SearchTrackResult[]> {
    if (!query.trim()) return []
    const { data } = await axios.get<NeteaseSearchResponse>(
      `${this.baseUrl}/search`,
      { params: { keywords: query, type: 1, limit: 20 }, timeout: 5000 }
    )
    const songs = data.result?.songs ?? []
    return songs.map((song) => {
      const artists = song.ar ?? song.artists ?? []
      const album = song.al ?? song.album
      return {
        source: 'netease',
        sourceId: String(song.id),
        title: song.name,
        artist: artists.map((a) => a.name).join(' / '),
        album: album?.name,
        coverUrl: album?.picUrl,
        duration: Math.floor(((song.dt ?? song.duration) ?? 0) / 1000)
      }
    })
  }

  async getTrackDetail(sourceId: string): Promise<Track> {
    const { data } = await axios.get<NeteaseSongResponse>(
      `${this.baseUrl}/song/detail`,
      { params: { ids: sourceId }, timeout: 5000 }
    )
    const song = data.songs?.[0]
    if (!song) {
      throw new MusicProviderError('Track not found')
    }
    return mapNeteaseSong(song)
  }

  async getLyric(sourceId: string): Promise<string | null> {
    const { data } = await axios.get<NeteaseLyricResponse>(
      `${this.baseUrl}/lyric`,
      { params: { id: sourceId }, timeout: 5000 }
    )
    const lyric = data.lrc?.lyric
    return typeof lyric === 'string' && lyric.trim() ? lyric : null
  }

  async getPlayableUrl(sourceId: string): Promise<string | null> {
    const { data } = await axios.get<NeteaseUrlResponse>(
      `${this.baseUrl}/song/url`,
      { params: { id: sourceId }, timeout: 5000 }
    )
    return data.data?.[0]?.url ?? null
  }
}
