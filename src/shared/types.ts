// ============================================================
// Domain types
// ============================================================

export type TrackSource = 'netease'

export type Track = {
  id: string
  source: TrackSource
  sourceId: string
  title: string
  artist: string
  album?: string
  coverUrl?: string
  duration: number
  lyric?: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

export type SearchTrackResult = {
  source: TrackSource
  sourceId: string
  title: string
  artist: string
  album?: string
  coverUrl?: string
  duration: number
}

export type SongAnalysis = {
  id: string
  trackId: string
  summary: string
  moodTags: string[]
  genreTags: string[]
  lyricThemes: string[]
  inspirationPoints: string[]
  avoidPoints: string[]
  recommendedThemes: CreationTheme[]
  createdAt: number
  updatedAt: number
}

export type CreationTheme = {
  id: string
  title: string
  description: string
  moodTags: string[]
  genreTags: string[]
}

export type Inspiration = {
  id: string
  trackId: string
  analysisId?: string
  title: string
  note?: string
  moodTags: string[]
  genreTags: string[]
  createdAt: number
  updatedAt: number
}

export type CreationProject = {
  id: string
  title: string
  sourceInspirationId?: string
  sourceTrackId?: string
  userIdea: string
  directions: CreationDirection[]
  createdAt: number
  updatedAt: number
}

export type CreationDirection = {
  id: string
  title: string
  description: string
  moodTags: string[]
  genreTags: string[]
  musicPrompt: string
  lyricTheme: string
  coverPrompt: string
}

export type PlayerState = {
  currentTrack: Track | null
  playableUrl: string | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
}

// ============================================================
// IPC input types
// ============================================================

export type AnalyzeTrackInput = {
  trackId: string
  userNote?: string
}

export type SaveInspirationInput = {
  trackId: string
  analysisId?: string
  note?: string
}

export type CreateFromInspirationInput = {
  inspirationId: string
  userIdea?: string
}

export type CreateFromIdeaInput = {
  userIdea: string
}

// ============================================================
// Agent input/output types
// ============================================================

export type AnalyzeSongAgentInput = {
  title: string
  artist: string
  lyric?: string
  userNote?: string
}

export type AnalyzeSongAgentOutput = {
  summary: string
  moodTags: string[]
  genreTags: string[]
  lyricThemes: string[]
  inspirationPoints: string[]
  avoidPoints: string[]
  recommendedThemes: Omit<CreationTheme, 'id'>[]
}

export type GenerateDirectionsAgentInput = {
  track?: Track
  analysis?: SongAnalysis
  userIdea?: string
}

export type GenerateDirectionsAgentOutput = {
  directions: Omit<CreationDirection, 'id'>[]
}

// ============================================================
// API surface types
// ============================================================

export type PlayerAPI = {
  playTrack(track: Track): Promise<void>
  pause(): Promise<void>
  resume(): Promise<void>
  seek(time: number): Promise<void>
  setVolume(volume: number): Promise<void>
  getState(): Promise<PlayerState>
}

export type TrackAPI = {
  searchTracks(query: string): Promise<SearchTrackResult[]>
  resolveTrack(input: { source: 'netease'; sourceId: string }): Promise<Track>
  getLyric(trackId: string): Promise<string | null>
  getPlayableUrl(trackId: string): Promise<string | null>
}

export type AnalysisAPI = {
  analyzeTrack(input: AnalyzeTrackInput): Promise<SongAnalysis>
  getByTrack(trackId: string): Promise<SongAnalysis | null>
}

export type InspirationAPI = {
  save(input: SaveInspirationInput): Promise<Inspiration>
  list(): Promise<Inspiration[]>
  remove(id: string): Promise<void>
}

export type CreationAPI = {
  createFromInspiration(input: CreateFromInspirationInput): Promise<CreationProject>
  createFromIdea(input: CreateFromIdeaInput): Promise<CreationProject>
  list(): Promise<CreationProject[]>
  get(id: string): Promise<CreationProject | null>
}

export type SettingsAPI = {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
}

export type MusedeskApi = {
  player: PlayerAPI
  tracks: TrackAPI
  analysis: AnalysisAPI
  inspiration: InspirationAPI
  creation: CreationAPI
  settings: SettingsAPI
}
