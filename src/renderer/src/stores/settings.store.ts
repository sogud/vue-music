import { defineStore } from 'pinia'
import type { RenderToolStatus } from '@shared/types'
import { settingsApi } from '../api/settings.api'

export const settingKeys = {
  neteaseBaseUrl: 'netease.baseUrl',
  aiProvider: 'ai.provider',
  aiModel: 'ai.model',
  aiBaseUrl: 'ai.baseUrl',
  appearanceTheme: 'appearance.theme',
  fluidSynthPath: 'fluidsynth.path',
  soundFontPath: 'soundfont.path'
} as const

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    values: {} as Record<string, string>,
    neteaseTest: '',
    aiTest: '',
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
    async configureAi(input: {
      provider: string
      model: string
      apiKey?: string
      baseUrl?: string
    }) {
      await settingsApi.configureAi(input)
      this.values[settingKeys.aiProvider] = input.provider
      this.values[settingKeys.aiModel] = input.model
      this.values[settingKeys.aiBaseUrl] = input.baseUrl ?? ''
    },
    exchangeOpenRouterCode(input: { code: string; codeVerifier: string }) {
      return settingsApi.exchangeOpenRouterCode(input)
    },
    listOpenRouterFreeModels() {
      return settingsApi.listOpenRouterFreeModels()
    },
    async testNetease() {
      const result = await settingsApi.testNetease()
      this.neteaseTest = result.message
      return result
    },
    async testAi() {
      const result = await settingsApi.testAi()
      this.aiTest = result.message
      return result
    },
    async testRenderer() {
      this.rendererStatus = await settingsApi.testRenderer()
      return this.rendererStatus
    }
  }
})
