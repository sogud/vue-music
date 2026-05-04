import { defineStore } from 'pinia'
import { settingKeys, useSettingsStore } from './settings.store'

export type ThemeMode = 'light' | 'dark'

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: 'light' as ThemeMode,
    loaded: false
  }),
  actions: {
    async load() {
      const settings = useSettingsStore()
      if (!Object.keys(settings.values).length) {
        await settings.load()
      }
      const stored = settings.values[settingKeys.appearanceTheme]
      this.mode = isThemeMode(stored) ? stored : 'light'
      applyTheme(this.mode)
      this.loaded = true
    },
    async setMode(mode: ThemeMode) {
      this.mode = mode
      applyTheme(mode)
      const settings = useSettingsStore()
      await settings.set(settingKeys.appearanceTheme, mode)
    },
    async toggle() {
      await this.setMode(this.mode === 'light' ? 'dark' : 'light')
    }
  }
})
