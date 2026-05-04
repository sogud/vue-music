import { defineStore } from 'pinia'
import type { RenderToolStatus } from '@shared/types'
import { settingsApi } from '../api/settings.api'

export const settingKeys = {
  neteaseBaseUrl: 'netease.baseUrl',
  piCommand: 'pi.command',
  piMode: 'pi.mode',
  piWorkdir: 'pi.workdir',
  appearanceTheme: 'appearance.theme',
  fluidSynthPath: 'fluidsynth.path',
  soundFontPath: 'soundfont.path'
} as const

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    values: {} as Record<string, string>,
    neteaseTest: '',
    piTest: '',
    rendererStatus: null as RenderToolStatus | null,
    loading: false
  }),
  actions: {
    async load() {
      this.values = await settingsApi.getAll()
    },
    async set(key: string, value: string) {
      await settingsApi.set(key, value)
      this.values[key] = value
    },
    async testNetease() {
      const result = await settingsApi.testNetease()
      this.neteaseTest = result.message
      return result
    },
    async testPi() {
      const result = await settingsApi.testPi()
      this.piTest = result.message
      return result
    },
    async testRenderer() {
      this.rendererStatus = await settingsApi.testRenderer()
      return this.rendererStatus
    }
  }
})
