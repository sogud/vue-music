import { config } from 'dotenv'

config()

export const env = {
  neteaseBaseUrl: process.env.OTODESK_NETEASE_BASE_URL ?? 'http://127.0.0.1:39271',
  piCommand: process.env.OTODESK_PI_COMMAND ?? 'pi',
  piMode: process.env.OTODESK_PI_MODE ?? 'rpc',
  piWorkdir: process.env.OTODESK_PI_WORKDIR ?? '',
  aiProvider: process.env.OTODESK_AI_PROVIDER ?? 'openai',
  aiModel: process.env.OTODESK_AI_MODEL ?? 'gpt-4o-mini',
  aiApiKey: process.env.OTODESK_AI_API_KEY ?? '',
  aiBaseUrl: process.env.OTODESK_AI_BASE_URL ?? '',
  aiApiType: process.env.OTODESK_AI_API_TYPE ?? 'openai-responses',
  fluidSynthPath: process.env.OTODESK_FLUIDSYNTH_PATH ?? '',
  soundFontPath: process.env.OTODESK_SOUNDFONT_PATH ?? ''
}
