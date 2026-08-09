# Music Generation API Research

Updated: 2026-05-16

This document tracks music-generation APIs worth testing in oto. Scope is direct audio/music output, not LLMs that only write prompts, lyrics, MIDI plans, or `composition.json`.

## Short Answer

Do not route all music generation through the Vercel AI SDK.

AI SDK remains useful for text reasoning, structured JSON, lyrics planning, prompt rewriting, and providers that expose OpenAI-compatible chat endpoints. Most music APIs use custom REST jobs, polling, streaming audio chunks, binary/hex audio payloads, or provider-specific SDKs. oto should add a separate main-process `music-generation` provider layer and keep API keys out of the renderer.

Recommended first test order:

1. MiniMax Music 2.6
2. Alibaba DashScope / Bailian Fun Music
3. Mureka
4. ElevenLabs Music
5. Google Lyria RealTime / Vertex Lyria
6. fal / Replicate hosted models
7. Beatoven, SOUNDRAW, Loudly for BGM/licensing-focused scenarios

Suno and Udio should be treated as third-party-wrapper-only unless an official developer API contract is available to the account.

## Provider Matrix

| Provider | API status | Main model/API | Output | Best test use | AI SDK direct? | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| MiniMax | Official API | `music-2.6`, `music-2.6-free`, `music-cover`, `music-cover-free` | Full song, instrumental, cover, mp3/wav/pcm style options | Full song with lyrics, instrumental, cover | No | Custom REST endpoint `/v1/music_generation`; returns audio data or URL depending output settings. |
| Alibaba DashScope / Bailian | Official API, invite/opening may be required | Fun Music / Bailian music generation | Chinese/English full song, non-stream or stream | Domestic cloud baseline, Chinese songs | No | DashScope-style endpoint and SSE streaming; language limits matter. |
| Mureka | Official API platform | `mureka-7.6`, `mureka-8`, `mureka-o1/o2` where enabled; `/v1/song/generate`, `/v1/instrumental/generate` | Full song, instrumental, lyrics, extension, tracks/stems features | Strong Suno/Udio-like alternative | No | Async job API with query endpoints; good candidate for complete workstation flow. |
| ElevenLabs | Official API | Eleven Music `/v1/music` | Song from prompt or composition plan | English/global full song benchmark | No | Official compose endpoint; output format is query-controlled. |
| Google Gemini API | Official API | Lyria RealTime | Real-time streaming music | Interactive generation and live steering | Not through normal AI SDK | Uses Gemini live music session APIs, not normal `generateText`. |
| Google Vertex AI | Official API | Lyria / Lyria music generation | Instrumental music from text | Enterprise Google Cloud baseline | Not through normal AI SDK | Better fit for backend/cloud account testing. |
| Stability AI | Official product/API positioning, details vary by access | Stable Audio 2.5 / Stable Audio Open | Music/audio samples, audio-to-audio, inpainting depending access | Audio texture, SFX, instrumental tests | No | Check account access; fal is often faster for Stable Audio Open tests. |
| fal.ai | Official hosted model API | `fal-ai/stable-audio`, Beatoven, ElevenLabs Music, other audio models | Depends model | Fast multi-model smoke tests | No | Unified fal client can reduce adapter work but is still separate from AI SDK. |
| Replicate | Official hosted model API | `minimax/music-2.6`, `riffusion/riffusion`, MusicGen variants | Depends model | Fast experiments and open/hosted comparisons | No | Some models proxy upstream commercial APIs; check data flow and cost. |
| Beatoven | Official API | maestro Music / SFX API | BGM, SFX | Commercial-safe background music | No | Strong licensing positioning; less "full pop song" oriented. |
| SOUNDRAW | Official B2B API | SOUNDRAW AI Music API | Royalty-free music | Enterprise BGM/product embedding | No | Pricing and access may be B2B-gated. |
| Loudly | Official API | Music API | Text-to-music, generator inputs, catalog, playlists, stems | App/game background music | No | Good licensing/product API angle. |
| AIVA | Product/API availability appears enterprise or account-gated | AIVA composition assistant | Instrumental composition, MIDI/MP3/WAV depending plan | Orchestral/cinematic/MIDI-oriented tests | No | Useful if editable composition output matters. |
| Tencent Cloud VOD | Official Tencent Cloud API | `CreateAigcAudioTask` | SFX and audio/BGM task outputs | Domestic cloud SFX/BGM tests | No | Current public doc is more SFX/BGM than full-song generation. |
| Runware / WaveSpeed / AI/ML API / Apiframe / ModelsLab / AI Magicx / MusicAPI | Aggregator or third-party APIs | Usually MiniMax, Suno, Udio, Riffusion, or Stable Audio behind one API | Depends provider | Broad comparison only | No | Keep isolated as configurable test providers. Do not treat wrapped Suno/Udio as official. |
| Riffusion API | Third-party/developer API | Riffusion-style generation | Short music excerpts | Low-priority experimentation | No | Verify provider legitimacy before production use. |
| Suno wrappers | Third-party wrappers mostly | Suno v5/v5 turbo through wrapper providers | Full songs, stems, extend depending wrapper | Quality comparison only | No | Do not treat as official Suno unless contract proves it. |
| Udio wrappers | Third-party wrappers mostly | Udio through wrapper providers | Full songs/extension depending wrapper | Quality comparison only | No | Same risk class as Suno wrappers. |

## Unified Test Shape

Use the same scenarios across providers:

| Scenario | Prompt | Lyrics | Target |
| --- | --- | --- | --- |
| Chinese vocal pop | `华语流行，女声，90 BPM，温暖但克制，钢琴和轻鼓，副歌旋律要记忆点强` | 8 to 12 lines with `[verse]` and `[chorus]` | Vocal quality, Mandarin pronunciation, hook |
| English indie pop | `Indie pop, 105 BPM, bright guitars, soft synth bass, intimate female vocal, clean modern mix` | 8 to 12 lines | English vocal and arrangement |
| Instrumental BGM | `Lo-fi study beat, 82 BPM, warm Rhodes piano, vinyl texture, soft drums, no vocal` | none | Loopability, mix quality |
| Cinematic cue | `Cinematic orchestral, 70 BPM, restrained emotional build, strings and piano, no vocal` | none | Dynamics and structure |
| Electronic drop | `Progressive house, 124 BPM, E minor, wide synth pads, strong drop, no vocal` | none | Beat clarity and bass |
| Cover/reference | Provider-specific reference audio | optional | Cover/stylistic transfer behavior |

## Evaluation Rubric

Score each generated result from 1 to 5:

| Field | Meaning |
| --- | --- |
| prompt_adherence | Does it follow genre, BPM, instruments, mood, vocal/instrumental requirement? |
| composition | Structure, hook, transitions, repetition control. |
| vocal_quality | Pronunciation, pitch stability, artifacts, emotion. |
| arrangement | Instrument balance, intro/verse/chorus/drop clarity. |
| mix_master | Loudness, clipping, bass control, stereo image. |
| editability | Does the API return stems, WAV, MIDI, lyrics timing, or useful metadata? |
| latency | Time to first result and total completion time. |
| reliability | Failure rate, polling/streaming stability, useful errors. |
| licensing | Commercial-use clarity, watermarking, content restrictions. |
| cost | Cost per usable minute/song. |

## Implementation Recommendation

Add a main-process service with this shape:

```ts
export type MusicGenerationProvider =
  | 'minimax'
  | 'dashscope-fun'
  | 'mureka'
  | 'elevenlabs'
  | 'google-lyria'
  | 'replicate'
  | 'fal'
  | 'beatoven'
  | 'soundraw'
  | 'loudly'
  | 'tencent-aigc-audio'
  | 'third-party-suno'
  | 'third-party-udio'

export interface GenerateMusicInput {
  provider: MusicGenerationProvider
  prompt: string
  lyrics?: string
  instrumental?: boolean
  referenceAudioUrl?: string
  format?: 'mp3' | 'wav' | 'pcm'
  durationSeconds?: number
  testCaseId?: string
}

export interface GenerateMusicTask {
  id: string
  provider: MusicGenerationProvider
  providerTaskId?: string
  status: 'queued' | 'running' | 'succeeded' | 'failed'
  audioUrl?: string
  localPath?: string
  metadata?: Record<string, unknown>
  error?: string
}
```

Keep provider secrets in main-process settings only. Renderer should call a whitelisted preload API such as:

```ts
window.otodesk.musicGeneration.create(input)
window.otodesk.musicGeneration.get(taskId)
window.otodesk.musicGeneration.list()
```

## Source Notes

- MiniMax official docs list `/v1/music_generation`, `music-2.6`, free variants, cover models, `lyrics_optimizer`, and `is_instrumental`.
- Alibaba Bailian Fun Music docs describe full Chinese/English song generation, stream/non-stream modes, prompt/lyrics limits, and 24-hour URL expiry.
- Mureka official docs describe song, instrumental, lyrics, extension APIs and async polling.
- ElevenLabs docs expose `POST /v1/music` to compose a song from prompt or composition plan.
- Google docs expose Lyria RealTime through Gemini API and Lyria through Vertex AI.
- fal and Replicate expose hosted model APIs useful for broad experiments.
- Suno/Udio public official API access remains unclear or unavailable for normal self-serve developers; wrapper APIs should be isolated as risky providers.
