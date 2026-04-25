export interface Song {
  id: string
  title: string
  artist: string
  album: string
  coverUrl: string
  durationSec: number
  tags: string[]
  lyricSnippet: string
}

export interface SongAnalysis {
  id: string
  songId: string
  mood: string[]
  style: string[]
  structure: string[]
  keywords: string[]
  summary: string
  createdAt: string
}

export interface Inspiration {
  id: string
  songId: string
  note: string
  createdAt: string
}

export interface CreationDirection {
  id: string
  songId: string
  title: string
  concept: string
  prompt: string
  keywords: string[]
  createdAt: string
}

export interface AgentAnalysisPayload {
  mood: string[]
  style: string[]
  structure: string[]
  keywords: string[]
  summary: string
  recommendedThemes: string[]
}

export interface HomeSnapshot {
  song: Song
  latestAnalysis: SongAnalysis | null
  directions: CreationDirection[]
  inspirations: Inspiration[]
}

export interface AnalyzeResult {
  analysis: SongAnalysis
  recommendedThemes: string[]
}

export interface MusedeskApi {
  getHomeSnapshot: () => Promise<HomeSnapshot>
  analyzeCurrentSong: () => Promise<AnalyzeResult>
  saveInspiration: (note: string) => Promise<Inspiration>
  generateDirection: () => Promise<CreationDirection>
}
