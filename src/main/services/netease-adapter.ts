import axios from 'axios'
import { appConfig } from '../config'
import type { Song } from '@shared/types'
import { currentSong } from '../mock-data'

interface NeteaseSongResponse {
  songs?: Array<{
    id: number
    name: string
    ar: Array<{ name: string }>
    al: { name: string; picUrl: string }
    dt: number
  }>
}

export async function getNowPlayingSong(): Promise<Song> {
  try {
    const { data } = await axios.get<NeteaseSongResponse>(`${appConfig.neteaseBaseUrl}/song/detail`, {
      params: { ids: appConfig.neteaseSongId },
      timeout: 2000
    })

    const song = data.songs?.[0]
    if (!song) return currentSong

    return {
      id: String(song.id),
      title: song.name,
      artist: song.ar.map((artist) => artist.name).join(' / '),
      album: song.al.name,
      coverUrl: song.al.picUrl,
      durationSec: Math.floor(song.dt / 1000),
      tags: currentSong.tags,
      lyricSnippet: currentSong.lyricSnippet
    }
  } catch {
    return currentSong
  }
}
