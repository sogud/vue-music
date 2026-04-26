import type { SearchTrackResult, Track } from '@shared/types'

export interface MusicProvider {
  searchTracks(query: string): Promise<SearchTrackResult[]>
  getTrackDetail(sourceId: string): Promise<Track>
  getLyric(sourceId: string): Promise<string | null>
  getPlayableUrl(sourceId: string): Promise<string | null>
}
