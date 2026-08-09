import { createReadStream } from 'node:fs'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { extname, resolve } from 'node:path'
import { URL } from 'node:url'
import { z } from 'zod'
import { musicService } from '../main/services/music/music-service'
import { analysisService } from '../main/services/analysis/analysis-service'
import { inspirationService } from '../main/services/inspiration/inspiration-service'
import { compositionService } from '../main/services/composition/composition-service'
import { projectService } from '../main/services/project/project-service'
import { renderService } from '../main/services/render/render-service'
import { settingsService } from '../main/services/settings/settings-service'
import { aiService } from '../main/services/ai/ai-service'
import { openRouterService } from '../main/services/ai/openrouter-service'
import { musicGenerationService } from '../main/services/music-generation/music-generation-service'
import { CompositionSchema } from '../main/services/composition/composition-validator'
import { getProjectsRoot } from '../main/utils/paths'

const port = Number(process.env.OTO_SERVER_PORT || process.env.PORT || 17373)

const TrackIdSchema = z.string().min(1)
const ResolveTrackSchema = z.object({
  source: z.literal('netease'),
  sourceId: z.string().min(1)
})
const AnalyzeTrackSchema = z.object({
  trackId: z.string().min(1),
  userNote: z.string().optional()
})
const SaveInspirationSchema = z.object({
  trackId: z.string().min(1),
  analysisId: z.string().optional(),
  note: z.string().optional()
})
const GenerateFromIdeaSchema = z.object({
  idea: z.string().min(1),
  bars: z.number().int().min(4).max(32),
  bpm: z.number().min(60).max(160).optional(),
  style: z.string().optional(),
  sourceAnalysisId: z.string().optional(),
  sourceInspirationId: z.string().optional()
})
const CreateProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  composition: CompositionSchema
})
const UpdateCompositionSchema = z.object({
  projectId: z.string().min(1),
  composition: CompositionSchema
})
const SetSchema = z.object({
  key: z.string().min(1),
  value: z.string()
})
const AiConfigSchema = z.object({
  provider: z.string().min(1).max(80),
  model: z.string().min(1).max(160),
  apiKey: z.string().max(4096).optional(),
  baseUrl: z.string().max(500).optional()
})
const OpenRouterOAuthSchema = z.object({
  code: z.string().min(1).max(4096),
  codeVerifier: z.string().min(32).max(256)
})
const ProviderSchema = z.enum([
  'minimax',
  'dashscope-fun',
  'mureka',
  'elevenlabs',
  'google-vertex-lyria',
  'replicate',
  'fal',
  'beatoven',
  'soundraw',
  'loudly',
  'aiva',
  'tencent-aigc-audio',
  'stability',
  'runware',
  'wavespeed',
  'aimlapi',
  'apiframe',
  'modelslab',
  'aimagicx',
  'musicapi',
  'third-party-suno',
  'third-party-udio',
  'riffusion'
])
const GenerateMusicSchema = z.object({
  provider: ProviderSchema,
  prompt: z.string().min(1).max(5000),
  lyrics: z.string().max(5000).optional(),
  instrumental: z.boolean().optional(),
  referenceAudioUrl: z.string().url().optional(),
  format: z.enum(['mp3', 'wav', 'pcm']).optional(),
  durationSeconds: z.number().int().min(1).max(360).optional(),
  model: z.string().max(200).optional()
})
const GeneratePatternSchema = z.object({
  idea: z.string().min(1).max(1000),
  style: z.string().max(200).optional(),
  bpm: z.number().int().min(60).max(160).optional(),
  bars: z.number().int().min(1).max(32).optional()
})

type Handler = (body: unknown) => unknown | Promise<unknown>

const handlers: Record<string, Handler> = {
  'music.searchTracks': (body) => musicService.searchTracks(z.string().parse(body)),
  'music.getDiscovery': () => musicService.getDiscovery(),
  'music.getPlaylistTracks': (body) => musicService.getPlaylistTracks(ResolveTrackSchema.parse(body)),
  'music.resolveTrack': (body) => musicService.resolveTrack(ResolveTrackSchema.parse(body)),
  'music.getLyric': (body) => musicService.getLyric(TrackIdSchema.parse(body)),
  'music.getPlayableUrl': (body) => musicService.getPlayableUrl(TrackIdSchema.parse(body)),

  'analysis.analyzeTrack': (body) => analysisService.analyzeTrack(AnalyzeTrackSchema.parse(body)),
  'analysis.getByTrack': (body) => analysisService.getByTrack(TrackIdSchema.parse(body)),

  'inspiration.save': (body) => inspirationService.save(SaveInspirationSchema.parse(body)),
  'inspiration.list': () => inspirationService.list(),
  'inspiration.remove': (body) => inspirationService.remove(z.string().min(1).parse(body)),

  'composition.generateFromIdea': (body) =>
    compositionService.generateFromIdea(GenerateFromIdeaSchema.parse(body)),
  'composition.validate': (body) => compositionService.validate(z.unknown().parse(body)),

  'project.create': (body) => projectService.create(CreateProjectSchema.parse(body)),
  'project.list': () => projectService.list(),
  'project.get': (body) => projectService.get(z.string().min(1).parse(body)),
  'project.updateComposition': (body) => {
    const parsed = UpdateCompositionSchema.parse(body)
    return projectService.updateComposition(parsed.projectId, parsed.composition)
  },
  'project.remove': (body) => projectService.remove(z.string().min(1).parse(body)),

  'render.checkTools': () => renderService.checkTools(),
  'render.renderProject': async (body) => {
    const output = await renderService.renderProject(z.string().min(1).parse(body))
    return { ...output, audioUrl: `/api/render/audio?path=${encodeURIComponent(output.wavPath)}` }
  },
  'render.openOutputFolder': (body) => renderService.openOutputFolder(z.string().min(1).parse(body)),

  'settings.get': (body) => {
    const key = z.string().min(1).parse(body)
    return key === 'ai.apiKey' ? null : settingsService.get(key)
  },
  'settings.set': (body) => {
    const parsed = SetSchema.parse(body)
    if (parsed.key === 'ai.apiKey') {
      throw new Error('Secret settings must be updated through the dedicated secure API.')
    }
    settingsService.set(parsed.key, parsed.value)
  },
  'settings.configureAi': (body) => {
    const parsed = AiConfigSchema.parse(body)
    settingsService.set('ai.provider', parsed.provider)
    settingsService.set('ai.model', parsed.model)
    settingsService.set('ai.baseUrl', parsed.baseUrl ?? '')
    if (typeof parsed.apiKey === 'string' && parsed.apiKey.length > 0) {
      settingsService.set('ai.apiKey', parsed.apiKey)
    }
  },
  'settings.exchangeOpenRouterCode': (body) => openRouterService.exchangeOAuthCode(OpenRouterOAuthSchema.parse(body)),
  'settings.listOpenRouterFreeModels': () => openRouterService.listFreeModels(),
  'settings.getAll': () => settingsService.getAll(),
  'settings.testNetease': () => musicService.testNetease(),
  'settings.testAi': () => aiService.test(),
  'settings.testPi': () => aiService.test(),
  'settings.testRenderer': () => renderService.checkTools(),

  'musicGeneration.listProviders': () => musicGenerationService.listProviders(),
  'musicGeneration.generate': (body) => musicGenerationService.generate(GenerateMusicSchema.parse(body)),
  'musicGeneration.testAll': (body) =>
    musicGenerationService.testAll(GenerateMusicSchema.omit({ provider: true }).partial().parse(body ?? {})),
  'pattern.generate': (body) => aiService.generatePattern(GeneratePatternSchema.parse(body))
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)
    if (request.method === 'GET' && url.pathname === '/api/health') {
      return sendJson(response, 200, { ok: true, app: 'oto-server' })
    }
    if (request.method === 'GET' && url.pathname === '/api/render/audio') {
      return streamAudio(url, response)
    }
    if (request.method !== 'POST' || !url.pathname.startsWith('/api/')) {
      return sendJson(response, 404, { error: 'Not found' })
    }

    const [domain, method] = url.pathname.replace(/^\/api\//, '').split('/')
    const handler = handlers[`${domain}.${method}`]
    if (!handler) return sendJson(response, 404, { error: `Unknown API method: ${domain}.${method}` })

    const body = await readJson(request)
    const result = await handler(body)
    return sendJson(response, 200, result ?? null)
  } catch (error) {
    return sendJson(response, 500, {
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`oto server listening at http://127.0.0.1:${port}`)
})

function readJson(request: IncomingMessage) {
  return new Promise<unknown>((resolve, reject) => {
    const chunks: Buffer[] = []
    request.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    request.on('error', reject)
    request.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8')
      if (!text) return resolve(null)
      try {
        resolve(JSON.parse(text))
      } catch (error) {
        reject(error)
      }
    })
  })
}

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  })
  response.end(JSON.stringify(body))
}

function streamAudio(url: URL, response: ServerResponse) {
  const input = url.searchParams.get('path')
  if (!input) return sendJson(response, 400, { error: 'Missing audio path' })
  const root = resolve(getProjectsRoot())
  const path = resolve(input)
  if (!path.startsWith(root)) return sendJson(response, 403, { error: 'Invalid audio path' })
  const contentType = extname(path) === '.wav' ? 'audio/wav' : 'application/octet-stream'
  response.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store'
  })
  createReadStream(path).pipe(response)
}
