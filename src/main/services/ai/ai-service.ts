import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateObject } from 'ai'
import { z } from 'zod'
import type {
  AnalyzeSongInput,
  AnalyzeSongOutput,
  GenerateCompositionInput,
  GenerateCompositionOutput,
  GeneratePatternInput,
  GeneratePatternOutput
} from '@shared/types'
import { settingsService } from '../settings/settings-service'
import { analyzeSongPrompt, generateCompositionPrompt } from '../pi/pi-prompts'
import { AnalyzeSongSchema, GenerateCompositionSchema } from '../pi/pi-schemas'
import { toErrorMessage } from '../../utils/errors'

type AiProviderId = 'openai' | 'google' | 'anthropic' | 'deepseek' | 'openrouter' | 'local'

const ConnectivitySchema = z.object({
  ok: z.literal(true),
  message: z.string().min(1)
})

const PatternSchema = z.object({
  title: z.string().min(1),
  code: z.string().min(1),
  notes: z.string().min(1)
})

const generatePatternPrompt = [
  '你是 oto 的音乐代码生成器。',
  '当前产品阶段只生成无人声、无歌词、无演唱的电子音乐草稿。',
  '你只能生成 oto pattern DSL，不要生成 JavaScript，不要生成 Strudel 代码。',
  '不要写 lyrics、vocal、singer、verse、chorus 等歌词或人声内容。',
  '优先电子音乐结构：drums、bass、lead、chords/pad，适合循环、试听和后续转 MIDI/WAV。',
  '风格可以偏 synthwave、deep house、ambient techno、future bass、lo-fi electronic、drum and bass、IDM。',
  '鼓组 pattern 每个 token 必须是 4 步，只能由 x 和 . 组成，例如 x...、..x.、....；不要输出 x.. 这种 3 步 token。',
  'DSL 语法：',
  'tempo <60-160>',
  'scale <Root> <major|minor>',
  '',
  'drums:',
  '  kick  x... x...',
  '  snare ..x. ..x.',
  '  hat   x x x x',
  '',
  'bass:',
  '  notes A2 A2 C3 E3',
  '  rhythm 1/2 1/2 1/2 1/2',
  '  sound warm_bass',
  '',
  'lead:',
  '  notes A4 C5 E5 G5',
  '  rhythm 1/4 1/4 1/2 1',
  '  sound soft_sine',
  '',
  'chords:',
  '  notes A3 C4 E4 | F3 A3 C4 | G3 B3 D4 | E3 G3 B3',
  '  rhythm 1 1 1 1',
  '  sound pad',
  '',
  '只输出 JSON：{ "title": string, "code": string, "notes": string }。',
  'code 必须能被上述 DSL 解析；不要使用未说明的语法。'
].join('\n')

const providerDefaults: Record<AiProviderId, { baseURL?: string; apiKeyRequired: boolean }> = {
  openai: { apiKeyRequired: true },
  google: { apiKeyRequired: true },
  anthropic: { apiKeyRequired: true },
  deepseek: { baseURL: 'https://api.deepseek.com/v1', apiKeyRequired: true },
  openrouter: { baseURL: 'https://openrouter.ai/api/v1', apiKeyRequired: true },
  local: { baseURL: 'http://localhost:1234/v1', apiKeyRequired: false }
}

function buildPrompt(input: unknown) {
  return [
    '请只根据下面的输入完成任务。',
    '只输出符合 schema 的 JSON。不要输出 markdown，不要解释。',
    '你不能读写文件，不能执行命令，不能调用外部工具。',
    '',
    '输入 JSON:',
    JSON.stringify(input, null, 2)
  ].join('\n')
}

function normalizeProvider(provider: string): AiProviderId {
  if (provider === 'google' || provider === 'anthropic' || provider === 'deepseek' || provider === 'openrouter' || provider === 'local') {
    return provider
  }
  return 'openai'
}

export class AiService {
  analyzeSong(input: AnalyzeSongInput): Promise<AnalyzeSongOutput> {
    return this.generateJson(analyzeSongPrompt, input, AnalyzeSongSchema, 'song_analysis').then((output) => ({
      summary: output.summary,
      moodTags: output.moodTags ?? [],
      genreTags: output.genreTags ?? [],
      lyricThemes: output.lyricThemes ?? [],
      inspirationPoints: output.inspirationPoints ?? [],
      avoidPoints: output.avoidPoints ?? [],
      creationSuggestions: output.creationSuggestions.map((suggestion) => ({
        title: suggestion.title,
        description: suggestion.description,
        moodTags: suggestion.moodTags ?? [],
        genreTags: suggestion.genreTags ?? []
      }))
    }))
  }

  generateComposition(input: GenerateCompositionInput): Promise<GenerateCompositionOutput> {
    return this.generateJson(generateCompositionPrompt, input, GenerateCompositionSchema, 'composition_generation')
  }

  async generatePattern(input: GeneratePatternInput): Promise<GeneratePatternOutput> {
    const output = await this.generateJson(generatePatternPrompt, input, PatternSchema, 'pattern_generation')
    return {
      ...output,
      code: normalizePatternCode(output.code)
    }
  }

  async test() {
    try {
      const provider = normalizeProvider(settingsService.getAiProvider())
      const model = settingsService.getAiModel().trim()
      const apiKey = settingsService.getAiApiKey().trim()
      const defaults = providerDefaults[provider]

      if (!model) return { ok: false, message: '请先填写 AI model。' }
      if (defaults.apiKeyRequired && !apiKey) return { ok: false, message: '请先填写 AI API Key。' }

      const result = await this.generateJson(
        '你是 oto 的 AI 连接测试器。只输出 JSON。',
        { task: 'connectivity_check', requiredOutput: { ok: true, message: 'ready' } },
        ConnectivitySchema,
        'connectivity_check'
      )
      return { ok: true, message: `AI SDK 连接正常：${provider}/${model}。${result.message}` }
    } catch (error) {
      return { ok: false, message: `AI 连接失败。${toErrorMessage(error)}` }
    }
  }

  private async generateJson<T>(system: string, input: unknown, schema: z.ZodType<T>, schemaName: string): Promise<T> {
    const response = await generateObject({
      model: this.createModel(),
      system,
      prompt: buildPrompt(input),
      schema,
      schemaName,
      temperature: schemaName === 'composition_generation' ? 0.62 : 0.4
    })
    return response.object
  }

  private createModel() {
    const provider = normalizeProvider(settingsService.getAiProvider())
    const model = settingsService.getAiModel().trim()
    const apiKey = settingsService.getAiApiKey().trim()
    const configuredBaseUrl = settingsService.getAiBaseUrl().trim()
    const apiType = settingsService.getAiApiType().trim()
    const defaults = providerDefaults[provider]
    const baseURL = configuredBaseUrl || defaults.baseURL

    if (!model) throw new Error('AI model is empty.')
    if (defaults.apiKeyRequired && !apiKey) throw new Error('AI API Key is empty.')

    if (provider === 'openai') {
      return createOpenAI({ apiKey: apiKey || undefined, baseURL: baseURL || undefined })(model)
    }
    if (provider === 'google') {
      return createGoogleGenerativeAI({ apiKey: apiKey || undefined, baseURL: baseURL || undefined })(model)
    }
    if (provider === 'anthropic') {
      return createAnthropic({ apiKey: apiKey || undefined, baseURL: baseURL || undefined })(model)
    }

    if (!baseURL) throw new Error('AI endpoint is empty.')
    const compatible = createOpenAICompatible({
      name: provider,
      baseURL,
      apiKey: apiKey || undefined,
      supportsStructuredOutputs: provider === 'local' || provider === 'openrouter' || apiType === 'json_schema'
    })
    return compatible(model)
  }
}

export const aiService = new AiService()

function normalizePatternCode(code: string) {
  let inDrums = false
  return code
    .split(/\r?\n/)
    .map((raw) => {
      const line = raw.trimEnd()
      const section = line.trim().match(/^(drums|bass|lead|chords):$/i)
      if (section) {
        inDrums = section[1].toLowerCase() === 'drums'
        return line
      }
      if (/^(bass|lead|chords):$/i.test(line.trim())) inDrums = false
      if (/^\s*rhythm\s+/i.test(line)) return line.replace(/\s+\|\s+/g, ' ').replace(/\|\s*/g, '')
      if (!inDrums) return line

      const drumMatch = line.match(/^(\s*)(kick|snare|hat|clap|perc)\s+([xX.\s]+)$/i)
      if (!drumMatch) return line
      const pattern = drumMatch[3].replace(/[^xX.]/g, '')
      const padded = pattern.padEnd(Math.ceil(pattern.length / 4) * 4, '.')
      const chunks = padded.match(/.{1,4}/g) ?? []
      return `${drumMatch[1]}${drumMatch[2].toLowerCase()}  ${chunks.join(' ')}`
    })
    .join('\n')
}
