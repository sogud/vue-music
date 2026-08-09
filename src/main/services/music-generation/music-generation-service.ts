import type {
  GenerateMusicApiInput,
  GenerateMusicApiResult,
  MusicGenerationProviderId,
  MusicGenerationProviderInfo,
  TestAllMusicApisResult
} from '../../../shared/types'
import { Buffer } from 'node:buffer'

type ProviderConfig = {
  id: MusicGenerationProviderId
  label: string
  status: MusicGenerationProviderInfo['status']
  requires: string[]
  notes: string
  run: (input: GenerateMusicApiInput) => Promise<GenerateMusicApiResult>
}

const DEFAULT_PROMPT =
  'Lo-fi study beat, 82 BPM, warm Rhodes piano, vinyl texture, soft drums, no vocal'

const DEFAULT_LYRICS = `[verse]
窗边的光慢慢醒来
旧唱片转过温柔尘埃
[chorus]
把心事放进口袋
跟着节拍走向人海`

function envValue(name: string) {
  return process.env[name]?.trim() ?? ''
}

function configured(requires: string[]) {
  return requires.every((name) => envValue(name).length > 0)
}

function skipped(provider: MusicGenerationProviderId, requires: string[]): GenerateMusicApiResult {
  return {
    provider,
    ok: false,
    status: 'skipped',
    message: `Missing required environment variable(s): ${requires.filter((name) => !envValue(name)).join(', ')}`
  }
}

async function postJson(url: string, headers: Record<string, string>, body: unknown) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  })
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.startsWith('audio/') || contentType.includes('octet-stream')) {
    const audioBase64 = Buffer.from(await response.arrayBuffer()).toString('base64')
    if (!response.ok) throw new Error(`HTTP ${response.status}: audio response failed`)
    return { audioBase64, mimeType: contentType }
  }
  const text = await response.text()
  let json: unknown = text
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    json = text
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${typeof json === 'string' ? json : JSON.stringify(json)}`)
  }
  return json
}

function readPath(value: unknown, path: Array<string | number>): unknown {
  return path.reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string | number, unknown>)[key]
    }
    return undefined
  }, value)
}

function stringAt(value: unknown, path: Array<string | number>) {
  const found = readPath(value, path)
  return typeof found === 'string' ? found : undefined
}

function success(
  provider: MusicGenerationProviderId,
  raw: unknown,
  extra: Partial<GenerateMusicApiResult> = {}
): GenerateMusicApiResult {
  return {
    provider,
    ok: true,
    status: extra.status ?? 'submitted',
    raw,
    message: extra.message ?? 'Request accepted.',
    ...extra
  }
}

function failure(provider: MusicGenerationProviderId, error: unknown): GenerateMusicApiResult {
  return {
    provider,
    ok: false,
    status: 'failed',
    message: error instanceof Error ? error.message : String(error)
  }
}

const providers: ProviderConfig[] = [
  {
    id: 'minimax',
    label: 'MiniMax Music',
    status: 'official',
    requires: ['MINIMAX_API_KEY'],
    notes: 'Official music_generation API for full songs, instrumentals, and cover generation.',
    async run(input) {
      const requires = ['MINIMAX_API_KEY']
      if (!configured(requires)) return skipped('minimax', requires)
      const model = (input.model ?? envValue('MINIMAX_MUSIC_MODEL')) || 'music-2.6-free'
      const raw = await postJson(
        envValue('MINIMAX_MUSIC_BASE_URL') || 'https://api.minimax.io/v1/music_generation',
        { Authorization: `Bearer ${envValue('MINIMAX_API_KEY')}` },
        {
          model,
          prompt: input.prompt,
          lyrics: input.instrumental ? undefined : input.lyrics,
          lyrics_optimizer: !input.instrumental && !input.lyrics,
          is_instrumental: input.instrumental ?? false,
          audio_setting: {
            sample_rate: 44100,
            bitrate: 256000,
            format: input.format ?? 'mp3'
          },
          output_format: 'url'
        }
      )
      return success('minimax', raw, {
        status: stringAt(raw, ['data', 'audio']) ? 'succeeded' : 'submitted',
        audioUrl: stringAt(raw, ['data', 'audio']),
        audioHex: stringAt(raw, ['data', 'audio']),
        message: 'MiniMax request completed.'
      })
    }
  },
  {
    id: 'dashscope-fun',
    label: 'Alibaba Bailian Fun Music',
    status: 'official',
    requires: ['DASHSCOPE_API_KEY'],
    notes: 'Official DashScope/Bailian Fun Music API. Access may require invite approval.',
    async run(input) {
      const requires = ['DASHSCOPE_API_KEY']
      if (!configured(requires)) return skipped('dashscope-fun', requires)
      const raw = await postJson(
        'https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer',
        { Authorization: `Bearer ${envValue('DASHSCOPE_API_KEY')}` },
        {
          model: input.model ?? 'fun-music-v1',
          input: {
            prompt: input.lyrics ? undefined : input.prompt,
            lyrics: input.lyrics,
            gender: envValue('DASHSCOPE_FUN_MUSIC_GENDER') || 'female',
            audio_format: input.format ?? 'mp3'
          }
        }
      )
      return success('dashscope-fun', raw, {
        status: stringAt(raw, ['output', 'audio', 'url']) ? 'succeeded' : 'submitted',
        audioUrl: stringAt(raw, ['output', 'audio', 'url']),
        message: 'DashScope Fun Music request completed.'
      })
    }
  },
  {
    id: 'mureka',
    label: 'Mureka',
    status: 'official',
    requires: ['MUREKA_API_KEY'],
    notes: 'Official async API for song, instrumental, lyrics, and extension workflows.',
    async run(input) {
      const requires = ['MUREKA_API_KEY']
      if (!configured(requires)) return skipped('mureka', requires)
      const baseUrl = envValue('MUREKA_BASE_URL') || 'https://api.mureka.ai'
      const endpoint = input.instrumental ? '/v1/instrumental/generate' : '/v1/song/generate'
      const raw = await postJson(
        `${baseUrl}${endpoint}`,
        { Authorization: `Bearer ${envValue('MUREKA_API_KEY')}` },
        {
          model: (input.model ?? envValue('MUREKA_MODEL')) || 'auto',
          prompt: input.prompt,
          lyrics: input.instrumental ? undefined : input.lyrics ?? DEFAULT_LYRICS,
          stream: false
        }
      )
      return success('mureka', raw, {
        providerTaskId: stringAt(raw, ['id']),
        message: 'Mureka task submitted.'
      })
    }
  },
  {
    id: 'elevenlabs',
    label: 'ElevenLabs Music',
    status: 'official',
    requires: ['ELEVENLABS_API_KEY'],
    notes: 'Official /v1/music compose endpoint.',
    async run(input) {
      const requires = ['ELEVENLABS_API_KEY']
      if (!configured(requires)) return skipped('elevenlabs', requires)
      const raw = await postJson(
        `https://api.elevenlabs.io/v1/music?output_format=${input.format === 'wav' ? 'pcm_44100' : 'mp3_44100_128'}`,
        { 'xi-api-key': envValue('ELEVENLABS_API_KEY') },
        { prompt: input.lyrics ? `${input.prompt}\n\nLyrics:\n${input.lyrics}` : input.prompt }
      )
      return success('elevenlabs', raw, {
        status: 'succeeded',
        audioBase64: stringAt(raw, ['audioBase64']),
        mimeType: stringAt(raw, ['mimeType']),
        message: 'ElevenLabs request completed.'
      })
    }
  },
  {
    id: 'google-vertex-lyria',
    label: 'Google Vertex AI Lyria',
    status: 'official',
    requires: ['GOOGLE_VERTEX_ACCESS_TOKEN', 'GOOGLE_VERTEX_PROJECT_ID'],
    notes: 'Official Vertex AI Lyria predict endpoint. Generates 30s instrumental WAV base64.',
    async run(input) {
      const requires = ['GOOGLE_VERTEX_ACCESS_TOKEN', 'GOOGLE_VERTEX_PROJECT_ID']
      if (!configured(requires)) return skipped('google-vertex-lyria', requires)
      const location = envValue('GOOGLE_VERTEX_LOCATION') || 'us-central1'
      const raw = await postJson(
        `https://${location}-aiplatform.googleapis.com/v1/projects/${envValue('GOOGLE_VERTEX_PROJECT_ID')}/locations/${location}/publishers/google/models/lyria-002:predict`,
        { Authorization: `Bearer ${envValue('GOOGLE_VERTEX_ACCESS_TOKEN')}` },
        {
          instances: [{ prompt: input.prompt, negative_prompt: input.instrumental ? 'vocals' : undefined }],
          parameters: { sample_count: 1 }
        }
      )
      return success('google-vertex-lyria', raw, {
        status: 'succeeded',
        audioBase64: stringAt(raw, ['predictions', 0, 'audioContent']),
        mimeType: stringAt(raw, ['predictions', 0, 'mimeType']),
        message: 'Vertex Lyria request completed.'
      })
    }
  },
  {
    id: 'fal',
    label: 'fal.ai',
    status: 'aggregator',
    requires: ['FAL_KEY'],
    notes: 'Hosted model API aggregator for Stable Audio, Beatoven, ElevenLabs Music, MiniMax, and others.',
    async run(input) {
      const requires = ['FAL_KEY']
      if (!configured(requires)) return skipped('fal', requires)
      const model = (input.model ?? envValue('FAL_MUSIC_MODEL')) || 'fal-ai/stable-audio'
      const raw = await postJson(
        `https://queue.fal.run/${model}`,
        { Authorization: `Key ${envValue('FAL_KEY')}` },
        {
          prompt: input.prompt,
          duration_seconds: input.durationSeconds ?? 30,
          output_format: input.format ?? 'mp3'
        }
      )
      return success('fal', raw, {
        providerTaskId: stringAt(raw, ['request_id']),
        message: 'fal task submitted.'
      })
    }
  },
  {
    id: 'replicate',
    label: 'Replicate',
    status: 'aggregator',
    requires: ['REPLICATE_API_TOKEN'],
    notes: 'Hosted model API for MiniMax Music, MusicGen, Riffusion, and other models.',
    async run(input) {
      const requires = ['REPLICATE_API_TOKEN']
      if (!configured(requires)) return skipped('replicate', requires)
      const version = input.model ?? envValue('REPLICATE_MUSIC_VERSION')
      if (!version) return skipped('replicate', ['REPLICATE_MUSIC_VERSION'])
      const raw = await postJson(
        'https://api.replicate.com/v1/predictions',
        { Authorization: `Bearer ${envValue('REPLICATE_API_TOKEN')}` },
        {
          version,
          input: {
            prompt: input.prompt,
            lyrics: input.instrumental ? undefined : input.lyrics,
            is_instrumental: input.instrumental ?? false
          }
        }
      )
      return success('replicate', raw, {
        providerTaskId: stringAt(raw, ['id']),
        message: 'Replicate prediction submitted.'
      })
    }
  },
  {
    id: 'tencent-aigc-audio',
    label: 'Tencent Cloud AIGC Audio',
    status: 'official',
    requires: ['TENCENT_AIGC_AUDIO_BASE_URL', 'TENCENT_AIGC_AUDIO_API_KEY'],
    notes: 'Configurable Tencent AIGC audio gateway. Native TC3 signing should be added if calling Tencent Cloud directly.',
    async run(input) {
      const requires = ['TENCENT_AIGC_AUDIO_BASE_URL', 'TENCENT_AIGC_AUDIO_API_KEY']
      if (!configured(requires)) return skipped('tencent-aigc-audio', requires)
      const raw = await postJson(
        envValue('TENCENT_AIGC_AUDIO_BASE_URL'),
        { Authorization: `Bearer ${envValue('TENCENT_AIGC_AUDIO_API_KEY')}` },
        {
          prompt: input.prompt,
          sceneType: input.instrumental ? 'bgm' : 'sfx',
          duration: input.durationSeconds ?? 30
        }
      )
      return success('tencent-aigc-audio', raw, {
        providerTaskId: stringAt(raw, ['Response', 'TaskId']) ?? stringAt(raw, ['taskId']),
        message: 'Tencent-compatible AIGC audio task submitted.'
      })
    }
  },
  configurableProvider('beatoven', 'Beatoven', 'official', ['BEATOVEN_API_KEY', 'BEATOVEN_MUSIC_BASE_URL']),
  configurableProvider('soundraw', 'SOUNDRAW', 'official', ['SOUNDRAW_API_KEY', 'SOUNDRAW_MUSIC_BASE_URL']),
  configurableProvider('loudly', 'Loudly', 'official', ['LOUDLY_API_KEY', 'LOUDLY_MUSIC_BASE_URL']),
  configurableProvider('aiva', 'AIVA', 'official', ['AIVA_API_KEY', 'AIVA_MUSIC_BASE_URL']),
  configurableProvider('stability', 'Stability / Stable Audio', 'official', [
    'STABILITY_API_KEY',
    'STABILITY_AUDIO_BASE_URL'
  ]),
  configurableProvider('runware', 'Runware', 'aggregator', ['RUNWARE_API_KEY', 'RUNWARE_MUSIC_BASE_URL']),
  configurableProvider('wavespeed', 'WaveSpeed', 'aggregator', ['WAVESPEED_API_KEY', 'WAVESPEED_MUSIC_BASE_URL']),
  configurableProvider('aimlapi', 'AI/ML API', 'aggregator', ['AIMLAPI_API_KEY', 'AIMLAPI_MUSIC_BASE_URL']),
  configurableProvider('apiframe', 'Apiframe', 'aggregator', ['APIFRAME_API_KEY', 'APIFRAME_MUSIC_BASE_URL']),
  configurableProvider('modelslab', 'ModelsLab', 'aggregator', ['MODELSLAB_API_KEY', 'MODELSLAB_MUSIC_BASE_URL']),
  configurableProvider('aimagicx', 'AI Magicx', 'aggregator', ['AIMAGICX_API_KEY', 'AIMAGICX_MUSIC_BASE_URL']),
  configurableProvider('musicapi', 'MusicAPI', 'aggregator', ['MUSICAPI_API_KEY', 'MUSICAPI_MUSIC_BASE_URL']),
  configurableProvider('third-party-suno', 'Third-party Suno wrapper', 'third-party', [
    'SUNO_API_KEY',
    'SUNO_MUSIC_BASE_URL'
  ]),
  configurableProvider('third-party-udio', 'Third-party Udio wrapper', 'third-party', [
    'UDIO_API_KEY',
    'UDIO_MUSIC_BASE_URL'
  ]),
  configurableProvider('riffusion', 'Riffusion API', 'third-party', [
    'RIFFUSION_API_KEY',
    'RIFFUSION_MUSIC_BASE_URL'
  ])
]

function configurableProvider(
  id: MusicGenerationProviderId,
  label: string,
  status: MusicGenerationProviderInfo['status'],
  requires: string[]
): ProviderConfig {
  return {
    id,
    label,
    status,
    requires,
    notes: 'Configurable generic music-generation REST provider. Set the base URL to the provider generation endpoint.',
    async run(input) {
      if (!configured(requires)) return skipped(id, requires)
      const [keyName, urlName] = requires
      const raw = await postJson(
        envValue(urlName),
        { Authorization: `Bearer ${envValue(keyName)}`, 'x-api-key': envValue(keyName) },
        {
          prompt: input.prompt,
          lyrics: input.lyrics,
          instrumental: input.instrumental ?? false,
          duration_seconds: input.durationSeconds ?? 30,
          format: input.format ?? 'mp3',
          model: input.model
        }
      )
      return success(id, raw, {
        providerTaskId: stringAt(raw, ['id']) ?? stringAt(raw, ['task_id']) ?? stringAt(raw, ['jobId']),
        audioUrl:
          stringAt(raw, ['audio_url']) ??
          stringAt(raw, ['audioUrl']) ??
          stringAt(raw, ['url']) ??
          stringAt(raw, ['data', 'url']),
        message: `${label} request submitted.`
      })
    }
  }
}

export class MusicGenerationService {
  listProviders(): MusicGenerationProviderInfo[] {
    return providers.map(({ id, label, status, requires, notes }) => ({
      id,
      label,
      status,
      requires,
      configured: configured(requires),
      notes
    }))
  }

  async generate(input: GenerateMusicApiInput): Promise<GenerateMusicApiResult> {
    const provider = providers.find((candidate) => candidate.id === input.provider)
    if (!provider) {
      return failure(input.provider, `Unknown provider: ${input.provider}`)
    }
    try {
      return await provider.run(input)
    } catch (error) {
      return failure(input.provider, error)
    }
  }

  async testAll(input: Partial<Omit<GenerateMusicApiInput, 'provider'>> = {}): Promise<TestAllMusicApisResult> {
    const results: GenerateMusicApiResult[] = []
    for (const provider of providers) {
      results.push(
        await this.generate({
          provider: provider.id,
          prompt: input.prompt ?? DEFAULT_PROMPT,
          lyrics: input.instrumental ? undefined : input.lyrics,
          instrumental: input.instrumental ?? true,
          format: input.format ?? 'mp3',
          durationSeconds: input.durationSeconds ?? 30,
          referenceAudioUrl: input.referenceAudioUrl,
          model: input.model
        })
      )
    }
    return { createdAt: Date.now(), results }
  }
}

export const musicGenerationService = new MusicGenerationService()
