#!/usr/bin/env node
import { config } from 'dotenv'
import { Buffer } from 'node:buffer'

config()

const prompt =
  process.env.MUSIC_TEST_PROMPT ||
  'Lo-fi study beat, 82 BPM, warm Rhodes piano, vinyl texture, soft drums, no vocal'
const lyrics =
  process.env.MUSIC_TEST_LYRICS ||
  `[verse]
窗边的光慢慢醒来
旧唱片转过温柔尘埃
[chorus]
把心事放进口袋
跟着节拍走向人海`

const providers = [
  ['minimax', ['MINIMAX_API_KEY'], testMiniMax],
  ['dashscope-fun', ['DASHSCOPE_API_KEY'], testDashScope],
  ['mureka', ['MUREKA_API_KEY'], testMureka],
  ['elevenlabs', ['ELEVENLABS_API_KEY'], testElevenLabs],
  ['google-vertex-lyria', ['GOOGLE_VERTEX_ACCESS_TOKEN', 'GOOGLE_VERTEX_PROJECT_ID'], testVertexLyria],
  ['fal', ['FAL_KEY'], testFal],
  ['replicate', ['REPLICATE_API_TOKEN', 'REPLICATE_MUSIC_VERSION'], testReplicate],
  ['beatoven', ['BEATOVEN_API_KEY', 'BEATOVEN_MUSIC_BASE_URL'], genericTest],
  ['soundraw', ['SOUNDRAW_API_KEY', 'SOUNDRAW_MUSIC_BASE_URL'], genericTest],
  ['loudly', ['LOUDLY_API_KEY', 'LOUDLY_MUSIC_BASE_URL'], genericTest],
  ['aiva', ['AIVA_API_KEY', 'AIVA_MUSIC_BASE_URL'], genericTest],
  ['stability', ['STABILITY_API_KEY', 'STABILITY_AUDIO_BASE_URL'], genericTest],
  ['tencent-aigc-audio', ['TENCENT_AIGC_AUDIO_API_KEY', 'TENCENT_AIGC_AUDIO_BASE_URL'], genericTest],
  ['runware', ['RUNWARE_API_KEY', 'RUNWARE_MUSIC_BASE_URL'], genericTest],
  ['wavespeed', ['WAVESPEED_API_KEY', 'WAVESPEED_MUSIC_BASE_URL'], genericTest],
  ['aimlapi', ['AIMLAPI_API_KEY', 'AIMLAPI_MUSIC_BASE_URL'], genericTest],
  ['apiframe', ['APIFRAME_API_KEY', 'APIFRAME_MUSIC_BASE_URL'], genericTest],
  ['modelslab', ['MODELSLAB_API_KEY', 'MODELSLAB_MUSIC_BASE_URL'], genericTest],
  ['aimagicx', ['AIMAGICX_API_KEY', 'AIMAGICX_MUSIC_BASE_URL'], genericTest],
  ['musicapi', ['MUSICAPI_API_KEY', 'MUSICAPI_MUSIC_BASE_URL'], genericTest],
  ['third-party-suno', ['SUNO_API_KEY', 'SUNO_MUSIC_BASE_URL'], genericTest],
  ['third-party-udio', ['UDIO_API_KEY', 'UDIO_MUSIC_BASE_URL'], genericTest],
  ['riffusion', ['RIFFUSION_API_KEY', 'RIFFUSION_MUSIC_BASE_URL'], genericTest]
]

function env(name) {
  return process.env[name]?.trim() || ''
}

function missing(requires) {
  return requires.filter((name) => !env(name))
}

async function postJson(url, headers, body) {
  const startedAt = Date.now()
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  })
  const contentType = response.headers.get('content-type') || ''
  let payload
  if (contentType.startsWith('audio/') || contentType.includes('octet-stream')) {
    payload = {
      audioBase64Length: Buffer.from(await response.arrayBuffer()).toString('base64').length,
      mimeType: contentType
    }
  } else {
    const text = await response.text()
    try {
      payload = text ? JSON.parse(text) : {}
    } catch {
      payload = text
    }
  }
  return {
    ok: response.ok,
    httpStatus: response.status,
    latencyMs: Date.now() - startedAt,
    payload
  }
}

async function testMiniMax() {
  return postJson(
    env('MINIMAX_MUSIC_BASE_URL') || 'https://api.minimax.io/v1/music_generation',
    { Authorization: `Bearer ${env('MINIMAX_API_KEY')}` },
    {
      model: env('MINIMAX_MUSIC_MODEL') || 'music-2.6-free',
      prompt,
      is_instrumental: true,
      audio_setting: { sample_rate: 44100, bitrate: 256000, format: 'mp3' },
      output_format: 'url'
    }
  )
}

async function testDashScope() {
  return postJson(
    'https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer',
    { Authorization: `Bearer ${env('DASHSCOPE_API_KEY')}` },
    {
      model: 'fun-music-v1',
      input: { prompt, gender: env('DASHSCOPE_FUN_MUSIC_GENDER') || 'female', audio_format: 'mp3' }
    }
  )
}

async function testMureka() {
  return postJson(
    `${env('MUREKA_BASE_URL') || 'https://api.mureka.ai'}/v1/instrumental/generate`,
    { Authorization: `Bearer ${env('MUREKA_API_KEY')}` },
    { model: env('MUREKA_MODEL') || 'auto', prompt, stream: false }
  )
}

async function testElevenLabs() {
  return postJson(
    'https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128',
    { 'xi-api-key': env('ELEVENLABS_API_KEY') },
    { prompt }
  )
}

async function testVertexLyria() {
  const location = env('GOOGLE_VERTEX_LOCATION') || 'us-central1'
  return postJson(
    `https://${location}-aiplatform.googleapis.com/v1/projects/${env('GOOGLE_VERTEX_PROJECT_ID')}/locations/${location}/publishers/google/models/lyria-002:predict`,
    { Authorization: `Bearer ${env('GOOGLE_VERTEX_ACCESS_TOKEN')}` },
    { instances: [{ prompt, negative_prompt: 'vocals' }], parameters: { sample_count: 1 } }
  )
}

async function testFal() {
  return postJson(
    `https://queue.fal.run/${env('FAL_MUSIC_MODEL') || 'fal-ai/stable-audio'}`,
    { Authorization: `Key ${env('FAL_KEY')}` },
    { prompt, duration_seconds: 30, output_format: 'mp3' }
  )
}

async function testReplicate() {
  return postJson(
    'https://api.replicate.com/v1/predictions',
    { Authorization: `Bearer ${env('REPLICATE_API_TOKEN')}` },
    {
      version: env('REPLICATE_MUSIC_VERSION'),
      input: { prompt, lyrics, is_instrumental: true }
    }
  )
}

async function genericTest(id) {
  const prefix = {
    beatoven: 'BEATOVEN',
    soundraw: 'SOUNDRAW',
    loudly: 'LOUDLY',
    aiva: 'AIVA',
    stability: 'STABILITY',
    'tencent-aigc-audio': 'TENCENT_AIGC_AUDIO',
    runware: 'RUNWARE',
    wavespeed: 'WAVESPEED',
    aimlapi: 'AIMLAPI',
    apiframe: 'APIFRAME',
    modelslab: 'MODELSLAB',
    aimagicx: 'AIMAGICX',
    musicapi: 'MUSICAPI',
    'third-party-suno': 'SUNO',
    'third-party-udio': 'UDIO',
    riffusion: 'RIFFUSION'
  }[id]
  return postJson(
    env(`${prefix}_MUSIC_BASE_URL`) || env(`${prefix}_AUDIO_BASE_URL`) || env(`${prefix}_BASE_URL`),
    {
      Authorization: `Bearer ${env(`${prefix}_API_KEY`)}`,
      'x-api-key': env(`${prefix}_API_KEY`)
    },
    { prompt, lyrics, instrumental: true, duration_seconds: 30, format: 'mp3' }
  )
}

const results = []
for (const [id, requires, run] of providers) {
  const skipped = missing(requires)
  if (skipped.length) {
    results.push({ provider: id, status: 'skipped', missing: skipped })
    continue
  }
  try {
    const result = await run(id)
    results.push({ provider: id, status: result.ok ? 'called' : 'failed', ...result })
  } catch (error) {
    results.push({ provider: id, status: 'failed', error: error instanceof Error ? error.message : String(error) })
  }
}

console.log(JSON.stringify({ createdAt: new Date().toISOString(), prompt, results }, null, 2))
