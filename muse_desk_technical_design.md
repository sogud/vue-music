MuseDesk No-Mock 完整技术实现方案

0. 给 Codex 的总要求

你是资深 Electron + Vue + TypeScript 工程师。

请实现 MuseDesk，一个桌面端 AI 音乐灵感工作台。

核心链路：

搜索 / 听歌 → AI 分析 → 保存灵感 → 生成创作方向

本项目明确禁止在运行态使用 mock 数据。

必须满足：

1. 应用启动后不显示假歌曲。
2. 不显示假分析结果。
3. 不显示假灵感。
4. 不显示假项目。
5. 没有真实数据时显示 empty state。
6. 所有歌曲数据来自 MusicProvider 的真实实现。
7. 所有 AI 分析来自真实 AgentProvider。
8. 所有用户数据来自本地 SQLite。
9. 测试代码可以使用 stub / fixture，但应用运行态不能使用 MockProvider。

第一版可以不接音乐生成 API，但必须真实完成：

1. 歌曲搜索
2. 歌词获取
3. 当前歌曲展示
4. AI 歌曲分析
5. 灵感保存
6. 创作方向生成
7. 本地持久化

如果第三方接口失败，显示错误或空状态，不允许用假数据顶替。

⸻

1. 产品边界

1.1 产品定位

MuseDesk 是一个简约、日系、高级感的 AI 音乐灵感工作台。

它不是完整播放器，不是网易云客户端，不是 DAW，不是聊天机器人。

核心价值：

让用户把喜欢的歌曲变成可创作的灵感。

1.2 第一版只做 4 个模块

1. 首页
2. 分析
3. 灵感
4. 创作

1.3 不做的功能

不做复杂歌单管理
不做复杂播放队列
不做评论区
不做社交
不做混音
不做母带
不做分轨
不做自动发布 X
不做复杂聊天界面
不做 mock 数据模式

⸻

2. 技术栈

桌面框架：Electron
构建工具：electron-vite
前端框架：Vue 3.5
语言：TypeScript
状态管理：Pinia
样式：Tailwind CSS
数据库：SQLite + better-sqlite3
Schema 校验：zod
AI Agent：Pi coding-agent RPC 或 OpenAI-compatible JSON API，二选一先实现 OpenAI-compatible，保留 Pi adapter
音乐数据：NeteaseCloudMusicApi adapter
音频播放：HTMLAudioElement
包管理：pnpm

推荐 Node：20.19+ 或 22.12+。

⸻

3. 总体架构

┌──────────────────────────────────────┐
│ Renderer: Vue 3.5                    │
│ 页面、组件、状态、音频播放             │
└──────────────────┬───────────────────┘
                   │ window.musedesk
┌──────────────────▼───────────────────┐
│ Preload Bridge                       │
│ contextBridge 暴露白名单 API          │
└──────────────────┬───────────────────┘
                   │ ipcRenderer.invoke
┌──────────────────▼───────────────────┐
│ Electron Main                        │
│ IPC handlers / Services / DB / Agent  │
└───────┬──────────────┬───────────────┘
        │              │
        ▼              ▼
┌──────────────┐ ┌────────────────────┐
│ SQLite       │ │ Providers          │
│ appData 本地  │ │ Netease / Agent    │
└──────────────┘ └────────────────────┘

3.1 分层原则

renderer：只负责 UI、状态和音频播放
preload：只暴露安全 API
main：负责数据库、第三方接口、Agent 调用、配置读取
provider：负责外部服务适配
repository：负责数据库读写
service：负责业务流程

3.2 安全原则

renderer 禁止直接访问 fs
renderer 禁止直接访问 child_process
renderer 禁止直接访问数据库
renderer 禁止直接读取 API key
renderer 禁止直接调用第三方接口

⸻

4. 环境配置

4.1 .env

项目根目录创建：

MUSEDESK_AGENT_PROVIDER=openai
MUSEDESK_OPENAI_BASE_URL=https://api.openai.com/v1
MUSEDESK_OPENAI_API_KEY=your_api_key
MUSEDESK_OPENAI_MODEL=gpt-4.1-mini
MUSEDESK_MUSIC_PROVIDER=netease
MUSEDESK_NETEASE_API_BASE_URL=http://127.0.0.1:3000

注意：

1. 不要把 .env 提交到 git。
2. API key 只允许 main 进程读取。
3. renderer 不允许读取 process.env。

4.2 NeteaseCloudMusicApi 启动方式

第一版建议把 NeteaseCloudMusicApi 作为外部本地服务运行，不要直接嵌入 Electron。

用户本地启动：

pnpm add -g NeteaseCloudMusicApi
NeteaseCloudMusicApi

或在 monorepo 中作为子服务：

apps/netease-api

MuseDesk 只通过 HTTP adapter 访问：

http://127.0.0.1:3000/search
http://127.0.0.1:3000/song/detail
http://127.0.0.1:3000/lyric
http://127.0.0.1:3000/song/url

如果服务不可用，UI 显示：

音乐服务未连接，请先启动 NeteaseCloudMusicApi。

不允许显示假歌曲。

⸻

5. 项目目录结构

musedesk/
├── src/
│   ├── main/
│   │   ├── index.ts
│   │   ├── window.ts
│   │   ├── env.ts
│   │   ├── ipc/
│   │   │   ├── register-ipc.ts
│   │   │   ├── track.ipc.ts
│   │   │   ├── analysis.ipc.ts
│   │   │   ├── inspiration.ipc.ts
│   │   │   ├── creation.ipc.ts
│   │   │   └── settings.ipc.ts
│   │   ├── services/
│   │   │   ├── music/
│   │   │   │   ├── music-provider.ts
│   │   │   │   ├── netease-provider.ts
│   │   │   │   └── music-service.ts
│   │   │   ├── agent/
│   │   │   │   ├── agent-provider.ts
│   │   │   │   ├── openai-agent-provider.ts
│   │   │   │   ├── pi-agent-provider.ts
│   │   │   │   ├── agent-service.ts
│   │   │   │   ├── prompts.ts
│   │   │   │   └── schemas.ts
│   │   │   ├── analysis/
│   │   │   │   └── analysis-service.ts
│   │   │   ├── inspiration/
│   │   │   │   └── inspiration-service.ts
│   │   │   ├── creation/
│   │   │   │   └── creation-service.ts
│   │   │   └── settings/
│   │   │       └── settings-service.ts
│   │   ├── storage/
│   │   │   ├── db.ts
│   │   │   ├── migrations.ts
│   │   │   └── repositories/
│   │   │       ├── track.repository.ts
│   │   │       ├── analysis.repository.ts
│   │   │       ├── inspiration.repository.ts
│   │   │       ├── creation.repository.ts
│   │   │       └── settings.repository.ts
│   │   ├── types/
│   │   │   ├── domain.ts
│   │   │   ├── ipc.ts
│   │   │   └── result.ts
│   │   └── utils/
│   │       ├── ids.ts
│   │       ├── json.ts
│   │       └── errors.ts
│   │
│   ├── preload/
│   │   ├── index.ts
│   │   └── api.ts
│   │
│   └── renderer/
│       ├── index.html
│       └── src/
│           ├── main.ts
│           ├── App.vue
│           ├── router/
│           │   └── index.ts
│           ├── pages/
│           │   ├── HomePage.vue
│           │   ├── AnalysisPage.vue
│           │   ├── InspirationPage.vue
│           │   ├── CreationPage.vue
│           │   └── SettingsPage.vue
│           ├── components/
│           │   ├── layout/
│           │   │   ├── AppShell.vue
│           │   │   ├── SideNav.vue
│           │   │   └── TopSearch.vue
│           │   ├── music/
│           │   │   ├── CurrentTrackCard.vue
│           │   │   ├── MiniPlayer.vue
│           │   │   ├── SearchOverlay.vue
│           │   │   └── TrackResultItem.vue
│           │   ├── assistant/
│           │   │   ├── AssistantPanel.vue
│           │   │   ├── AnalysisSummary.vue
│           │   │   └── ThemeSuggestionList.vue
│           │   ├── inspiration/
│           │   │   ├── InspirationCard.vue
│           │   │   └── InspirationList.vue
│           │   └── creation/
│           │       ├── CreationDirectionCard.vue
│           │       └── PromptBlock.vue
│           ├── stores/
│           │   ├── music.store.ts
│           │   ├── analysis.store.ts
│           │   ├── inspiration.store.ts
│           │   ├── creation.store.ts
│           │   └── settings.store.ts
│           ├── api/
│           │   ├── music.api.ts
│           │   ├── analysis.api.ts
│           │   ├── inspiration.api.ts
│           │   ├── creation.api.ts
│           │   └── settings.api.ts
│           ├── types/
│           │   └── domain.ts
│           └── styles/
│               └── main.css
│
├── electron.vite.config.ts
├── package.json
├── .env.example
└── README.md

⸻

6. package.json 依赖

{
  "dependencies": {
    "@electron-toolkit/preload": "latest",
    "@electron-toolkit/utils": "latest",
    "@vitejs/plugin-vue": "latest",
    "better-sqlite3": "latest",
    "dotenv": "latest",
    "electron-updater": "latest",
    "pinia": "latest",
    "tailwindcss": "latest",
    "vue": "latest",
    "vue-router": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "electron": "latest",
    "electron-builder": "latest",
    "electron-vite": "latest",
    "typescript": "latest",
    "vite": "latest",
    "vue-tsc": "latest"
  }
}

如果 better-sqlite3 在 Electron 构建中出现 native module 问题，需要配置 electron-builder rebuild 或使用 electron-rebuild。

⸻

7. Domain 类型

文件：src/main/types/domain.ts

renderer 需要同样类型时，可以复制到 src/renderer/src/types/domain.ts，或者后续抽成 shared 包。

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

⸻

8. SQLite 设计

8.1 数据库位置

使用 Electron appData：

const dbPath = path.join(app.getPath('userData'), 'musedesk.sqlite')

8.2 migrations

文件：src/main/storage/migrations.ts

CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  cover_url TEXT,
  duration INTEGER NOT NULL DEFAULT 0,
  lyric TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(source, source_id)
);
CREATE TABLE IF NOT EXISTS song_analyses (
  id TEXT PRIMARY KEY,
  track_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  mood_tags TEXT NOT NULL,
  genre_tags TEXT NOT NULL,
  lyric_themes TEXT NOT NULL,
  inspiration_points TEXT NOT NULL,
  avoid_points TEXT NOT NULL,
  recommended_themes TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(track_id) REFERENCES tracks(id)
);
CREATE TABLE IF NOT EXISTS inspirations (
  id TEXT PRIMARY KEY,
  track_id TEXT NOT NULL,
  analysis_id TEXT,
  title TEXT NOT NULL,
  note TEXT,
  mood_tags TEXT NOT NULL,
  genre_tags TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(track_id) REFERENCES tracks(id),
  FOREIGN KEY(analysis_id) REFERENCES song_analyses(id)
);
CREATE TABLE IF NOT EXISTS creation_projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  source_inspiration_id TEXT,
  source_track_id TEXT,
  user_idea TEXT NOT NULL,
  directions TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

8.3 Repository 约束

repository 层必须负责 JSON 序列化：

mood_tags → string[]
genre_tags → string[]
recommended_themes → CreationTheme[]
directions → CreationDirection[]

业务层禁止直接处理数据库 JSON 字符串。

⸻

9. Provider 设计

9.1 MusicProvider

文件：src/main/services/music/music-provider.ts

import type { SearchTrackResult, Track } from '../../types/domain'
export interface MusicProvider {
  searchTracks(query: string): Promise<SearchTrackResult[]>
  getTrackDetail(sourceId: string): Promise<Track>
  getLyric(sourceId: string): Promise<string | null>
  getPlayableUrl(sourceId: string): Promise<string | null>
}

9.2 NeteaseProvider

文件：src/main/services/music/netease-provider.ts

要求：

1. 通过 HTTP 调用本地 NeteaseCloudMusicApi。
2. baseUrl 从 env 或 settings 读取。
3. 不允许 fallback 到假歌曲。
4. 接口失败时抛出 MusicProviderError。
5. 返回结果必须 normalize 成统一 Track / SearchTrackResult。

接口映射：

searchTracks(query) → GET /search?keywords={query}&type=1&limit=20
getTrackDetail(id) → GET /song/detail?ids={id}
getLyric(id) → GET /lyric?id={id}
getPlayableUrl(id) → GET /song/url?id={id}

实现重点：

export class NeteaseProvider implements MusicProvider {
  constructor(private readonly baseUrl: string) {}
  async searchTracks(query: string): Promise<SearchTrackResult[]> {
    if (!query.trim()) return []
    const url = new URL('/search', this.baseUrl)
    url.searchParams.set('keywords', query)
    url.searchParams.set('type', '1')
    url.searchParams.set('limit', '20')
    const json = await this.request(url)
    const songs = json?.result?.songs ?? []
    return songs.map((song: any) => ({
      source: 'netease',
      sourceId: String(song.id),
      title: song.name,
      artist: Array.isArray(song.artists)
        ? song.artists.map((a: any) => a.name).join(' / ')
        : '',
      album: song.album?.name,
      coverUrl: song.album?.picUrl,
      duration: Math.floor((song.duration ?? 0) / 1000)
    }))
  }
  async getTrackDetail(sourceId: string): Promise<Track> {
    const url = new URL('/song/detail', this.baseUrl)
    url.searchParams.set('ids', sourceId)
    const json = await this.request(url)
    const song = json?.songs?.[0]
    if (!song) throw new Error('Track not found')
    const now = Date.now()
    return {
      id: crypto.randomUUID(),
      source: 'netease',
      sourceId,
      title: song.name,
      artist: Array.isArray(song.ar)
        ? song.ar.map((a: any) => a.name).join(' / ')
        : '',
      album: song.al?.name,
      coverUrl: song.al?.picUrl,
      duration: Math.floor((song.dt ?? 0) / 1000),
      tags: [],
      createdAt: now,
      updatedAt: now
    }
  }
  async getLyric(sourceId: string): Promise<string | null> {
    const url = new URL('/lyric', this.baseUrl)
    url.searchParams.set('id', sourceId)
    const json = await this.request(url)
    const lyric = json?.lrc?.lyric
    return typeof lyric === 'string' && lyric.trim() ? lyric : null
  }
  async getPlayableUrl(sourceId: string): Promise<string | null> {
    const url = new URL('/song/url', this.baseUrl)
    url.searchParams.set('id', sourceId)
    const json = await this.request(url)
    const data = json?.data?.[0]
    return data?.url ?? null
  }
  private async request(url: URL): Promise<any> {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Netease request failed: ${res.status}`)
    }
    return res.json()
  }
}

注意：上面代码中的 crypto.randomUUID() 如在 main 进程不可用，可改用 node:crypto 的 randomUUID。

⸻

10. AgentProvider 设计

10.1 AgentProvider interface

文件：src/main/services/agent/agent-provider.ts

import type { CreationDirection, CreationTheme } from '../../types/domain'
export type AnalyzeSongInput = {
  title: string
  artist: string
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
  recommendedThemes: Omit<CreationTheme, 'id'>[]
}
export type GenerateDirectionsInput = {
  title?: string
  artist?: string
  analysisSummary?: string
  moodTags?: string[]
  genreTags?: string[]
  lyricThemes?: string[]
  inspirationPoints?: string[]
  avoidPoints?: string[]
  userIdea?: string
}
export type GenerateDirectionsOutput = {
  directions: Omit<CreationDirection, 'id'>[]
}
export interface AgentProvider {
  analyzeSong(input: AnalyzeSongInput): Promise<AnalyzeSongOutput>
  generateCreationDirections(input: GenerateDirectionsInput): Promise<GenerateDirectionsOutput>
}

10.2 运行态禁止 mock provider

不得实现 MockAgentProvider 作为运行态 provider。

允许测试目录出现：

src/main/services/agent/__tests__/agent-provider.stub.ts

但不允许应用运行逻辑引用它。

10.3 OpenAICompatibleAgentProvider

第一版先实现这个，保证可运行。

文件：src/main/services/agent/openai-agent-provider.ts

要求：

1. baseUrl/apiKey/model 从 env/settings 读取。
2. 使用 chat completions 或 responses API 均可。
3. 强制要求 JSON 输出。
4. 使用 zod 校验。
5. 失败时抛出 AgentError。
6. 不允许返回假数据。

实现方式：

export class OpenAICompatibleAgentProvider implements AgentProvider {
  constructor(
    private readonly config: {
      baseUrl: string
      apiKey: string
      model: string
    }
  ) {}
  async analyzeSong(input: AnalyzeSongInput): Promise<AnalyzeSongOutput> {
    const content = await this.chatJson({
      system: ANALYZE_SONG_SYSTEM_PROMPT,
      user: JSON.stringify(input)
    })
    return AnalyzeSongSchema.parse(content)
  }
  async generateCreationDirections(input: GenerateDirectionsInput): Promise<GenerateDirectionsOutput> {
    const content = await this.chatJson({
      system: GENERATE_DIRECTIONS_SYSTEM_PROMPT,
      user: JSON.stringify(input)
    })
    return GenerateDirectionsSchema.parse(content)
  }
  private async chatJson(input: { system: string; user: string }): Promise<unknown> {
    const res = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: input.system },
          { role: 'user', content: input.user }
        ]
      })
    })
    if (!res.ok) {
      throw new Error(`Agent request failed: ${res.status}`)
    }
    const json = await res.json()
    const text = json?.choices?.[0]?.message?.content
    if (!text) throw new Error('Agent returned empty content')
    return JSON.parse(text)
  }
}

10.4 PiAgentProvider

保留 Pi adapter，但第一版可以在 OpenAI provider 跑通后实现。

文件：src/main/services/agent/pi-agent-provider.ts

实现要求：

1. 使用 Pi RPC 或 SDK。
2. 只允许两个任务：analyze_song、generate_creation_directions。
3. 要求 Pi 输出严格 JSON。
4. 禁止 Pi 使用 bash、write、edit、read 任意目录等 coding tools。
5. 只把歌曲结构化输入交给 Pi。
6. 不允许 Pi 操作本地文件。

如果 Pi 无法限制工具权限，则暂时不要启用 PiProvider，只保留代码接口。

⸻

11. Agent Prompt

11.1 ANALYZE_SONG_SYSTEM_PROMPT

文件：src/main/services/agent/prompts.ts

export const ANALYZE_SONG_SYSTEM_PROMPT = `
你是一个音乐创作分析助手。
你的任务是把一首歌分析成可以用于原创音乐创作的结构化信息。
你只能输出 JSON，不要输出 markdown，不要输出解释。
要求：
1. 分析歌曲情绪。
2. 分析可能的风格。
3. 分析歌词主题。
4. 提炼可以借鉴的抽象元素，例如氛围、节奏感、叙事主题、乐器方向。
5. 提炼必须规避的元素，例如旋律、歌词、歌手声线、标志性编曲。
6. 生成 3 个推荐创作主题。
7. 不要鼓励复制现有歌曲。
8. 语言简短，适合 UI 卡片展示。
输出 JSON 格式：
{
  "summary": "string",
  "moodTags": ["string"],
  "genreTags": ["string"],
  "lyricThemes": ["string"],
  "inspirationPoints": ["string"],
  "avoidPoints": ["string"],
  "recommendedThemes": [
    {
      "title": "string",
      "description": "string",
      "moodTags": ["string"],
      "genreTags": ["string"]
    }
  ]
}
`

11.2 GENERATE_DIRECTIONS_SYSTEM_PROMPT

export const GENERATE_DIRECTIONS_SYSTEM_PROMPT = `
你是一个 AI 音乐创作策划助手。
请基于歌曲分析结果或用户想法，生成 3 个原创音乐创作方向。
你只能输出 JSON，不要输出 markdown，不要输出解释。
要求：
1. 每个方向必须是原创方向。
2. 可以参考情绪、风格、氛围和抽象创作元素。
3. 不要复制现有歌曲旋律、歌词、歌手声线、标志性编曲。
4. 每个方向包含标题、描述、情绪标签、风格标签、音乐 prompt、歌词主题、封面 prompt。
5. musicPrompt 用英文，方便给 AI 音乐工具使用。
6. 其他字段用中文，方便产品展示。
输出 JSON 格式：
{
  "directions": [
    {
      "title": "string",
      "description": "string",
      "moodTags": ["string"],
      "genreTags": ["string"],
      "musicPrompt": "string",
      "lyricTheme": "string",
      "coverPrompt": "string"
    }
  ]
}
`

⸻

12. Zod Schema

文件：src/main/services/agent/schemas.ts

import { z } from 'zod'
export const AnalyzeSongSchema = z.object({
  summary: z.string().min(1),
  moodTags: z.array(z.string()).min(1),
  genreTags: z.array(z.string()).min(1),
  lyricThemes: z.array(z.string()),
  inspirationPoints: z.array(z.string()).min(1),
  avoidPoints: z.array(z.string()).min(1),
  recommendedThemes: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      moodTags: z.array(z.string()),
      genreTags: z.array(z.string())
    })
  ).min(1).max(3)
})
export const GenerateDirectionsSchema = z.object({
  directions: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      moodTags: z.array(z.string()).min(1),
      genreTags: z.array(z.string()).min(1),
      musicPrompt: z.string().min(20),
      lyricTheme: z.string().min(1),
      coverPrompt: z.string().min(10)
    })
  ).length(3)
})

⸻

13. Service 业务流程

13.1 MusicService

职责：

1. 调用 MusicProvider 搜索歌曲。
2. 获取歌曲详情。
3. 获取歌词。
4. 获取可播放 URL。
5. 将用户选择过的歌曲 upsert 到数据库。

关键方法：

class MusicService {
  async searchTracks(query: string): Promise<SearchTrackResult[]>
  async resolveTrack(source: 'netease', sourceId: string): Promise<Track>
  async getLyric(trackId: string): Promise<string | null>
  async getPlayableUrl(trackId: string): Promise<string | null>
}

13.2 AnalysisService

流程：

1. 接收 trackId 和 userNote。
2. 从数据库读取 Track。
3. 如果 Track 没有 lyric，则调用 MusicProvider.getLyric。
4. 更新 Track.lyric。
5. 调用 AgentProvider.analyzeSong。
6. zod 校验。
7. 给 recommendedThemes 补 id。
8. 保存 SongAnalysis。
9. 返回 SongAnalysis。

不得做：

不得在 Agent 失败时生成假分析。

失败时：

抛出错误，UI 展示失败信息。

13.3 InspirationService

流程：

1. 接收 trackId、analysisId、note。
2. 查询 Track。
3. 如果有 analysisId，读取分析标签。
4. 生成 Inspiration。
5. 保存数据库。
6. 返回 Inspiration。

13.4 CreationService

流程：

1. 从 inspirationId 或 userIdea 创建。
2. 如果从 inspiration 创建，则读取 Track、Analysis。
3. 调用 AgentProvider.generateCreationDirections。
4. zod 校验。
5. 给 directions 补 id。
6. 保存 CreationProject。
7. 返回 CreationProject。

⸻

14. IPC 设计

14.1 preload API

文件：src/preload/api.ts

export type MuseDeskAPI = {
  music: {
    searchTracks(query: string): Promise<SearchTrackResult[]>
    resolveTrack(input: { source: 'netease'; sourceId: string }): Promise<Track>
    getPlayableUrl(trackId: string): Promise<string | null>
    getLyric(trackId: string): Promise<string | null>
  }
  analysis: {
    analyzeTrack(input: { trackId: string; userNote?: string }): Promise<SongAnalysis>
    getByTrack(trackId: string): Promise<SongAnalysis | null>
  }
  inspiration: {
    save(input: { trackId: string; analysisId?: string; note?: string }): Promise<Inspiration>
    list(): Promise<Inspiration[]>
    remove(id: string): Promise<void>
  }
  creation: {
    createFromInspiration(input: { inspirationId: string; userIdea?: string }): Promise<CreationProject>
    createFromIdea(input: { userIdea: string }): Promise<CreationProject>
    list(): Promise<CreationProject[]>
    get(id: string): Promise<CreationProject | null>
  }
  settings: {
    get(key: string): Promise<string | null>
    set(key: string, value: string): Promise<void>
  }
}

14.2 IPC channels

music:searchTracks
music:resolveTrack
music:getPlayableUrl
music:getLyric
analysis:analyzeTrack
analysis:getByTrack
inspiration:save
inspiration:list
inspiration:remove
creation:createFromInspiration
creation:createFromIdea
creation:list
creation:get
settings:get
settings:set

14.3 IPC 参数校验

所有 IPC handler 必须校验输入。

可以使用 zod：

const AnalyzeTrackInputSchema = z.object({
  trackId: z.string().min(1),
  userNote: z.string().optional()
})

⸻

15. Renderer 实现

15.1 页面结构

HomePage
- AppShell
  - TopSearch
  - CurrentTrackCard
  - PrimaryActionCards
  - AssistantPanel
  - MiniPlayer
AnalysisPage
- AnalysisResult
- SaveInspirationButton
- GenerateDirectionButton
InspirationPage
- InspirationList
- InspirationCard
CreationPage
- IdeaInput
- CreationDirectionList
- PromptBlock

15.2 首页 empty state

应用第一次打开，没有当前歌曲时显示：

还没有选择歌曲
搜索一首歌，开始你的音乐灵感分析。

按钮：

搜索歌曲

不要显示假歌曲。

15.3 搜索交互

流程：

用户在顶部搜索框输入关键词
↓
调用 window.musedesk.music.searchTracks
↓
显示搜索结果弹层
↓
用户点击某首歌
↓
调用 resolveTrack
↓
设置为 currentTrack
↓
调用 getPlayableUrl
↓
如果有 URL，设置 audio.src
↓
如果没有 URL，显示“无法播放，但可以分析”

15.4 音频播放

renderer 使用 HTMLAudioElement：

const audio = new Audio()

状态保存在 music.store.ts：

currentTrack
playableUrl
isPlaying
currentTime
duration
volume

注意：

getPlayableUrl 失败时，不影响 AI 分析。

15.5 AI 分析交互

按钮：

AI 分析歌曲

禁用条件：

没有 currentTrack 时禁用
正在分析时 loading

成功：

右侧 AssistantPanel 显示分析摘要
AnalysisPage 展示完整结构化卡片

失败：

显示错误，不展示假分析。

15.6 灵感保存交互

按钮：

保存为灵感

如果没有分析结果：

允许保存歌曲本身，但标签为空。

如果有分析结果：

保存歌曲 + 分析标签。

15.7 创作方向交互

入口：

1. 从当前分析生成
2. 从灵感库生成
3. 从一句话想法生成

成功后跳转到 CreationPage。

失败时显示错误，不展示假方向。

⸻

16. UI 设计规则

必须保持简约。

16.1 视觉规范

背景：#F8F6F2 或 #FAF9F6
主文字：#1F1F1F
次文字：#77736B
边框：#E8E1D8
卡片背景：#FFFFFF / 半透明米白
强调色：低饱和金色 / 灰棕色
圆角：16px - 24px
阴影：极轻

16.2 首页限制

首页最多展示：

1. 当前歌曲卡片
2. AI 分析歌曲
3. 生成创作方向
4. 开始原创
5. 右侧 AI 摘要
6. 底部播放器

禁止：

复杂图表
大聊天窗口
密集按钮
大量标签
复杂推荐列表

16.3 右侧 AssistantPanel

只显示：

当前歌曲小卡片
情绪标签
推荐创作主题
一个轻量输入框

不要做完整聊天历史。

⸻

17. 设置页

SettingsPage 必须支持：

1. Netease API Base URL
2. Agent Provider: openai | pi
3. OpenAI Base URL
4. OpenAI API Key
5. OpenAI Model
6. 测试音乐服务连接
7. 测试 Agent 连接

API key 保存：

第一版可以保存到 SQLite settings 表。
后续应迁移到系统 keychain。

注意：renderer 不直接读取 key，只提交到 main 保存。

⸻

18. 错误处理

18.1 音乐服务未连接

显示：

音乐服务未连接
请确认 NeteaseCloudMusicApi 正在运行。

操作：

打开设置
重试

18.2 搜索无结果

显示：

没有找到相关歌曲。

18.3 无法播放

显示：

当前歌曲暂时无法播放，但仍可以用于 AI 分析。

18.4 歌词为空

显示：

未获取到歌词，AI 将基于歌曲信息进行分析。

18.5 Agent 未配置

显示：

AI 助手未配置
请在设置中填写 API Key 和模型。

18.6 Agent 返回格式错误

显示：

AI 返回格式异常，请重试。

不要用假结果代替。

⸻

19. 安全要求

19.1 BrowserWindow

webPreferences: {
  preload: path.join(__dirname, '../preload/index.js'),
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: false
}

19.2 禁止行为

禁止 renderer 使用 require
禁止 renderer 访问 fs
禁止 renderer 访问 child_process
禁止 renderer 读取 process.env
禁止把 API key 传给 renderer
禁止运行态 mock provider

19.3 Pi Provider 限制

Pi coding-agent 如启用，必须限制工具权限。

不允许：

bash
write
edit
读取用户任意目录
执行系统命令

如果当前 Pi 接入方式无法做到权限限制，则不要默认启用 Pi。

⸻

20. 实现顺序

Phase 1：项目初始化

任务：

1. 创建 electron-vite + Vue + TypeScript 项目
2. 配置 Tailwind CSS
3. 配置 Pinia
4. 配置 Vue Router
5. 配置 .env.example
6. 配置 main/preload/renderer 三段结构

验收：

应用能启动
首页显示 empty state
没有 mock 歌曲

Phase 2：SQLite 数据层

任务：

1. 接入 better-sqlite3
2. 在 appData 创建 musedesk.sqlite
3. 执行 migrations
4. 实现 repositories
5. 实现 settings 读写

验收：

数据库真实创建
重启应用后数据保留

Phase 3：IPC 和 Preload

任务：

1. 定义 MuseDeskAPI
2. contextBridge 暴露 window.musedesk
3. 注册 IPC handlers
4. 所有 IPC 输入做校验

验收：

renderer 能调用 settings.get/set
renderer 不能访问 Node API

Phase 4：NeteaseProvider

任务：

1. 实现 MusicProvider interface
2. 实现 NeteaseProvider
3. 实现 searchTracks
4. 实现 resolveTrack
5. 实现 getLyric
6. 实现 getPlayableUrl
7. 实现错误提示

验收：

用户能真实搜索歌曲
用户选择歌曲后保存到 SQLite
没有服务时显示错误
不出现假数据

Phase 5：播放器基础

任务：

1. renderer 使用 HTMLAudioElement
2. MiniPlayer 控制播放、暂停、进度、音量
3. 播放 URL 来自 main
4. 播放失败不影响分析

验收：

如果 URL 可用，可以播放
如果 URL 不可用，显示无法播放提示

Phase 6：OpenAICompatibleAgentProvider

任务：

1. 实现 AgentProvider interface
2. 实现 OpenAICompatibleAgentProvider
3. 编写 prompts
4. 编写 zod schemas
5. 实现 JSON 校验
6. 实现 Agent 配置检查

验收：

用户配置 API key 后，可以真实分析歌曲
无 API key 时提示配置
返回格式错误时提示重试
不返回假分析

Phase 7：AI 分析链路

任务：

1. 实现 AnalysisService
2. 获取 track + lyric
3. 调用 AgentProvider.analyzeSong
4. 保存 SongAnalysis
5. UI 展示结构化结果

验收：

点击 AI 分析后生成真实 AI 分析结果
结果保存到 SQLite
刷新后仍可查看

Phase 8：灵感库

任务：

1. 实现 InspirationService
2. 保存当前歌曲为灵感
3. 保存分析标签
4. 实现 InspirationPage
5. 支持删除灵感

验收：

用户可以保存灵感
灵感库显示真实保存内容
没有灵感时显示 empty state

Phase 9：创作方向

任务：

1. 实现 CreationService
2. 从 inspiration 创建项目
3. 从 userIdea 创建项目
4. 调用 AgentProvider.generateCreationDirections
5. 保存 CreationProject
6. 展示 3 个方向
7. 支持复制 prompt

验收：

生成方向来自真实 Agent
失败时显示错误
不出现假方向

Phase 10：打磨

任务：

1. 优化日系简约 UI
2. 添加 loading / error / empty state
3. 添加设置页连接测试
4. 添加 README
5. 添加基础测试

⸻

21. Codex 执行提示词

把下面这段直接给 Codex：

你是资深 Electron + Vue + TypeScript 工程师。
请从零实现 MuseDesk。
MuseDesk 是一个桌面端 AI 音乐灵感工作台，核心链路是：搜索 / 听歌 → AI 分析 → 保存灵感 → 生成创作方向。
重要要求：运行态禁止 mock 数据。
禁止：
- 不要 mock 歌曲。
- 不要 mock 分析。
- 不要 mock 灵感。
- 不要 mock 项目。
- 应用首次打开必须显示 empty state。
- 第三方接口失败时显示错误，不要用假数据代替。
- 测试代码可以用 stub，但运行态 provider 不能是 mock。
技术栈：
- Electron
- electron-vite
- Vue 3.5
- TypeScript
- Pinia
- Tailwind CSS
- SQLite + better-sqlite3
- zod
架构要求：
- 使用 src/main、src/preload、src/renderer 结构。
- renderer 不允许直接访问 Node API。
- preload 只暴露 window.musedesk 白名单 API。
- main 进程负责数据库、第三方音乐接口、Agent 调用、设置读写。
- 所有外部音乐接口通过 MusicProvider。
- 所有 AI 能力通过 AgentProvider。
必须实现真实 provider：
1. NeteaseProvider：通过本地 NeteaseCloudMusicApi HTTP 服务搜索歌曲、获取详情、歌词、播放 URL。
2. OpenAICompatibleAgentProvider：通过 OpenAI-compatible chat completions API 输出 JSON，完成歌曲分析和创作方向生成。
必须实现页面：
1. HomePage：首页，empty state、当前歌曲卡片、3 个主操作、右侧 AI 摘要、底部 mini 播放器。
2. AnalysisPage：展示结构化分析结果。
3. InspirationPage：展示用户保存的灵感。
4. CreationPage：展示 AI 生成的 3 个创作方向。
5. SettingsPage：配置 Netease API Base URL、OpenAI Base URL、API Key、Model，并支持连接测试。
必须实现数据库表：
- tracks
- song_analyses
- inspirations
- creation_projects
- settings
必须实现 IPC：
- music:searchTracks
- music:resolveTrack
- music:getPlayableUrl
- music:getLyric
- analysis:analyzeTrack
- analysis:getByTrack
- inspiration:save
- inspiration:list
- inspiration:remove
- creation:createFromInspiration
- creation:createFromIdea
- creation:list
- creation:get
- settings:get
- settings:set
UI 风格：
- 日间模式。
- 日系简约。
- 米白背景。
- 大量留白。
- 低复杂度。
- 圆角卡片。
- 柔和边框。
- 不要大聊天窗口。
- 不要复杂图表。
- 首页最多 3 个主操作。
实现顺序：
1. 初始化项目和目录结构。
2. 实现类型定义。
3. 实现 SQLite 和 migrations。
4. 实现 repositories。
5. 实现 preload API 和 IPC handlers。
6. 实现 SettingsPage。
7. 实现 NeteaseProvider。
8. 实现歌曲搜索和选择。
9. 实现 mini 播放器。
10. 实现 OpenAICompatibleAgentProvider。
11. 实现 AI 分析链路。
12. 实现灵感保存和灵感库。
13. 实现创作方向生成。
14. 打磨 UI、loading、error、empty state。
请直接生成可运行代码。
不要生成 mock 数据。
不要在页面里硬编码假歌曲。

⸻

22. 成功标准

第一版完成后必须满足：

1. 首次打开应用没有假数据。
2. 用户能配置 NeteaseCloudMusicApi base URL。
3. 用户能真实搜索歌曲。
4. 用户能选择歌曲作为当前歌曲。
5. 用户能获取歌词。
6. 如果播放 URL 可用，用户能播放。
7. 如果播放 URL 不可用，用户能继续分析。
8. 用户配置 Agent 后能真实分析歌曲。
9. 分析结果能保存到 SQLite。
10. 用户能保存灵感。
11. 用户能基于灵感生成 3 个创作方向。
12. 所有失败都有明确错误提示。
13. 应用运行态没有 MockProvider。

最终判断：

这个应用不是用假数据展示高级感，而是用真实搜索、真实分析、真实保存，跑通“听歌到创作”的闭环。