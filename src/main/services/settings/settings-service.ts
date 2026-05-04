import { env } from '../../env'
import { settingsRepository } from '../../storage/repositories/settings.repository'

export const SETTING_KEYS = {
  neteaseBaseUrl: 'netease.baseUrl',
  piCommand: 'pi.command',
  piMode: 'pi.mode',
  piWorkdir: 'pi.workdir',
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
    return settingsRepository.getAll()
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

  getFluidSynthPath() {
    return this.get(SETTING_KEYS.fluidSynthPath) || env.fluidSynthPath
  }

  getSoundFontPath() {
    return this.get(SETTING_KEYS.soundFontPath) || env.soundFontPath
  }
}

export const settingsService = new SettingsService()
