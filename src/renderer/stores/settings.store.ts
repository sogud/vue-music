import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const values = ref<Record<string, string>>({})

  async function loadSetting(key: string) {
    const value = await window.musedesk.settings.get(key)
    if (value !== null) {
      values.value[key] = value
    }
    return value
  }

  async function saveSetting(key: string, value: string) {
    await window.musedesk.settings.set(key, value)
    values.value[key] = value
  }

  return {
    values,
    loadSetting,
    saveSetting
  }
})
