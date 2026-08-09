import { ipcMain } from 'electron'
import { z } from 'zod'
import { musicGenerationService } from '../services/music-generation/music-generation-service'

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

const GenerateSchema = z.object({
  provider: ProviderSchema,
  prompt: z.string().min(1).max(5000),
  lyrics: z.string().max(5000).optional(),
  instrumental: z.boolean().optional(),
  referenceAudioUrl: z.string().url().optional(),
  format: z.enum(['mp3', 'wav', 'pcm']).optional(),
  durationSeconds: z.number().int().min(1).max(360).optional(),
  model: z.string().max(200).optional()
})

const TestAllSchema = GenerateSchema.omit({ provider: true }).partial().optional()

export function registerMusicGenerationIpc() {
  ipcMain.handle('musicGeneration:listProviders', () => musicGenerationService.listProviders())
  ipcMain.handle('musicGeneration:generate', (_event, input) => {
    const parsed = GenerateSchema.parse(input)
    return musicGenerationService.generate(parsed)
  })
  ipcMain.handle('musicGeneration:testAll', (_event, input) => {
    const parsed = TestAllSchema.parse(input)
    return musicGenerationService.testAll(parsed)
  })
}
