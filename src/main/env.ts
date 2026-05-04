import { config } from 'dotenv'

config()

export const env = {
  neteaseBaseUrl: process.env.OTODESK_NETEASE_BASE_URL ?? 'http://127.0.0.1:3000',
  piCommand: process.env.OTODESK_PI_COMMAND ?? 'pi',
  piMode: process.env.OTODESK_PI_MODE ?? 'rpc',
  piWorkdir: process.env.OTODESK_PI_WORKDIR ?? '',
  fluidSynthPath: process.env.OTODESK_FLUIDSYNTH_PATH ?? 'fluidsynth',
  soundFontPath: process.env.OTODESK_SOUNDFONT_PATH ?? ''
}
