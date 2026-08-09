import { env } from '../../env'
import { settingsRepository } from '../../storage/repositories/settings.repository'

export const SETTING_KEYS = {
  neteaseBaseUrl: 'netease.baseUrl',
  piCommand: 'pi.command',
  piMode: 'pi.mode',
  piWorkdir: 'pi.workdir',
  aiProvider: 'ai.provider',
  aiModel: 'ai.model',
  aiApiKey: 'ai.apiKey',
  aiBaseUrl: 'ai.baseUrl',
  aiApiType: 'ai.apiType',
  appearanceTheme: 'appearance.theme',
  fluidSynthPath: 'fluidsynth.path',
  soundFontPath: 'soundfont.path'
} as const

export class SettingsService {
  get(key: string) {
    return settingsRepository.get(key)
  }

  set(key: string, value: string) {
    settingsRepository.set(key, value)
  }

  getAll() {
    const values = settingsRepository.getAll()
    delete values[SETTING_KEYS.aiApiKey]
    return values
  }

  getNeteaseBaseUrl() {
    return this.get(SETTING_KEYS.neteaseBaseUrl) || env.neteaseBaseUrl
  }

  getPiCommand() {
    return this.get(SETTING_KEYS.piCommand) || env.piCommand
  }

  getPiMode() {
    return this.get(SETTING_KEYS.piMode) || env.piMode
  }

  getPiWorkdir() {
    return this.get(SETTING_KEYS.piWorkdir) || env.piWorkdir || undefined
  }

  getAiProvider() {
    return this.get(SETTING_KEYS.aiProvider) || env.aiProvider
  }

  getAiModel() {
    return this.get(SETTING_KEYS.aiModel) || env.aiModel
  }

  getAiApiKey() {
    return this.get(SETTING_KEYS.aiApiKey) || env.aiApiKey
  }

  getAiBaseUrl() {
    return this.get(SETTING_KEYS.aiBaseUrl) || env.aiBaseUrl
  }

  getAiApiType() {
    return this.get(SETTING_KEYS.aiApiType) || env.aiApiType
  }

  getFluidSynthPath() {
    return this.get(SETTING_KEYS.fluidSynthPath) || env.fluidSynthPath
  }

  getSoundFontPath() {
    return this.get(SETTING_KEYS.soundFontPath) || env.soundFontPath
  }
}

export const settingsService = new SettingsService()
