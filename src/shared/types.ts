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

export type MusicList = {
  source: TrackSource
  sourceId: string
  title: string
  coverUrl?: string
  description?: string
  trackCount?: number
  playCount?: number
  updateFrequency?: string
}

export type MusicDiscovery = {
  newSongs: SearchTrackResult[]
  playlists: MusicList[]
  charts: MusicList[]
  hotSearches: string[]
}

export type CreationSuggestion = {
  id: string
  title: string
  description: string
  moodTags: string[]
  genreTags: string[]
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
  creationSuggestions: CreationSuggestion[]
  createdAt: number
  updatedAt: number
}

export type Inspiration = {
  id: string
  trackId: string
  analysisId?: string
  title: string
  note?: string
  moodTags: string[]
  genreTags: string[]
  trackTitle?: string
  trackArtist?: string
  createdAt: number
  updatedAt: number
}

export type Composition = {
  version: '1.0'
  id: string
  title: string
  description?: string
  bpm: number
  timeSignature: [4, 4]
  key: string
  bars: number
  tracks: CompositionTrack[]
  createdAt: number
  updatedAt: number
}

export type CompositionTrack = InstrumentTrack | DrumTrack

export type InstrumentTrack = {
  id: string
  type: 'instrument'
  name: string
  role: 'chords' | 'bass' | 'melody' | 'pad' | 'lead'
  channel: number
  program: number
  volume: number
  pan: number
  notes: NoteEvent[]
}

export type DrumTrack = {
  id: string
  type: 'drums'
  name: string
  role: 'drums'
  channel: 9
  volume: number
  pan: number
  notes: NoteEvent[]
}

export type NoteEvent = {
  pitch: number
  start: number
  duration: number
  velocity: number
}

export type Project = {
  id: string
  title: string
  description?: string
  sourceTrackId?: string
  sourceInspirationId?: string
  userIdea?: string
  composition: Composition
  createdAt: number
  updatedAt: number
}

export type RenderOutput = {
  id: string
  projectId: string
  midiPath: string
  wavPath: string
  audioUrl: string
  createdAt: number
}

export type RenderToolStatus = {
  fluidsynthAvailable: boolean
  fluidsynthPath?: string
  soundFontConfigured: boolean
  soundFontPath?: string
  canRender: boolean
  message?: string
}

export type MusicGenerationProviderId =
  | 'minimax'
  | 'dashscope-fun'
  | 'mureka'
  | 'elevenlabs'
  | 'google-vertex-lyria'
  | 'replicate'
  | 'fal'
  | 'beatoven'
  | 'soundraw'
  | 'loudly'
  | 'aiva'
  | 'tencent-aigc-audio'
  | 'stability'
  | 'runware'
  | 'wavespeed'
  | 'aimlapi'
  | 'apiframe'
  | 'modelslab'
  | 'aimagicx'
  | 'musicapi'
  | 'third-party-suno'
  | 'third-party-udio'
  | 'riffusion'

export type MusicGenerationProviderInfo = {
  id: MusicGenerationProviderId
  label: string
  status: 'official' | 'aggregator' | 'third-party' | 'experimental'
  requires: string[]
  configured: boolean
  notes: string
}

export type GenerateMusicApiInput = {
  provider: MusicGenerationProviderId
  prompt: string
  lyrics?: string
  instrumental?: boolean
  referenceAudioUrl?: string
  format?: 'mp3' | 'wav' | 'pcm'
  durationSeconds?: number
  model?: string
}

export type GenerateMusicApiResult = {
  provider: MusicGenerationProviderId
  ok: boolean
  status: 'skipped' | 'submitted' | 'succeeded' | 'failed'
  providerTaskId?: string
  audioUrl?: string
  audioBase64?: string
  audioHex?: string
  mimeType?: string
  raw?: unknown
  message: string
}

export type TestAllMusicApisResult = {
  createdAt: number
  results: GenerateMusicApiResult[]
}

export type GeneratePatternInput = {
  idea: string
  style?: string
  bpm?: number
  bars?: number
}

export type GeneratePatternOutput = {
  code: string
  title: string
  notes: string
}

export type AnalyzeSongInput = {
  title: string
  artist: string
  album?: string
  lyric?: string
  userNote?: string
}

export type AnalyzeSongOutput = {
  summary: string
  moodTags: string[]
  genreTags: string[]
  lyricThemes: string[]
  inspirationPoints: string[]
  avoidPoints: string[]
  creationSuggestions: Omit<CreationSuggestion, 'id'>[]
}

export type GenerateCompositionInput = {
  idea: string
  bars: number
  bpm?: number
  style?: string
  sourceAnalysis?: SongAnalysis
}

export type GenerateCompositionOutput = {
  composition: Composition
}

export type MusicProvider = {
  searchTracks(query: string): Promise<SearchTrackResult[]>
  getDiscovery(): Promise<MusicDiscovery>
  getPlaylistTracks(sourceId: string): Promise<SearchTrackResult[]>
  getTrackDetail(sourceId: string): Promise<Track>
  getLyric(sourceId: string): Promise<string | null>
  getPlayableUrl(sourceId: string): Promise<string | null>
}

export type MusicApi = {
  searchTracks(query: string): Promise<SearchTrackResult[]>
  getDiscovery(): Promise<MusicDiscovery>
  getPlaylistTracks(input: { source: TrackSource; sourceId: string }): Promise<SearchTrackResult[]>
  resolveTrack(input: { source: TrackSource; sourceId: string }): Promise<Track>
  getLyric(trackId: string): Promise<string | null>
  getPlayableUrl(trackId: string): Promise<string | null>
}

export type AnalysisApi = {
  analyzeTrack(input: { trackId: string; userNote?: string }): Promise<SongAnalysis>
  getByTrack(trackId: string): Promise<SongAnalysis | null>
}

export type InspirationApi = {
  save(input: { trackId: string; analysisId?: string; note?: string }): Promise<Inspiration>
  list(): Promise<Inspiration[]>
  remove(id: string): Promise<void>
}

export type CompositionApi = {
  generateFromIdea(input: {
    idea: string
    bars: number
    bpm?: number
    style?: string
    sourceAnalysisId?: string
    sourceInspirationId?: string
  }): Promise<Project>
  validate(composition: unknown): Promise<{ ok: boolean; errors: string[] }>
}

export type ProjectApi = {
  create(input: { title: string; description?: string; composition: Composition }): Promise<Project>
  list(): Promise<Project[]>
  get(id: string): Promise<Project | null>
  updateComposition(projectId: string, composition: Composition): Promise<Project>
  remove(id: string): Promise<void>
}

export type RenderApi = {
  checkTools(): Promise<RenderToolStatus>
  renderProject(projectId: string): Promise<RenderOutput>
  openOutputFolder(projectId: string): Promise<void>
}

export type SettingsApi = {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  configureAi(input: {
    provider: string
    model: string
    apiKey?: string
    baseUrl?: string
  }): Promise<void>
  exchangeOpenRouterCode(input: { code: string; codeVerifier: string }): Promise<{ key: string }>
  listOpenRouterFreeModels(): Promise<{ models: Array<{ id: string; name: string }> }>
  getAll(): Promise<Record<string, string>>
  testNetease(): Promise<{ ok: boolean; message: string }>
  testAi(): Promise<{ ok: boolean; message: string }>
  testPi(): Promise<{ ok: boolean; message: string }>
  testRenderer(): Promise<RenderToolStatus>
}

export type MusicGenerationApi = {
  listProviders(): Promise<MusicGenerationProviderInfo[]>
  generate(input: GenerateMusicApiInput): Promise<GenerateMusicApiResult>
  testAll(input?: Partial<Omit<GenerateMusicApiInput, 'provider'>>): Promise<TestAllMusicApisResult>
}

export type PatternApi = {
  generate(input: GeneratePatternInput): Promise<GeneratePatternOutput>
}

export type OtoDeskApi = {
  music: MusicApi
  musicGeneration: MusicGenerationApi
  pattern: PatternApi
  analysis: AnalysisApi
  inspiration: InspirationApi
  composition: CompositionApi
  project: ProjectApi
  render: RenderApi
  settings: SettingsApi
}
