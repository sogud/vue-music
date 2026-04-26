<template>
  <div>
    <h1>{{ t('settings.title') }}</h1>

    <section class="card setting-section">
      <h3>{{ t('settings.agent') }}</h3>
      <label>
        <span>{{ t('settings.agentProvider') }}</span>
        <select :value="agentProvider" @change="onAgentChange">
          <option value="openai">OpenAI Compatible</option>
          <option value="pi">Pi Agent</option>
        </select>
      </label>
      <label v-if="agentProvider === 'openai'">
        <span>{{ t('settings.openaiBaseUrl') }}</span>
        <input v-model="openaiBaseUrl" placeholder="https://api.openai.com/v1" />
      </label>
      <label v-if="agentProvider === 'openai'">
        <span>{{ t('settings.openaiApiKey') }}</span>
        <input v-model="openaiApiKey" type="password" placeholder="sk-..." />
      </label>
      <label v-if="agentProvider === 'openai'">
        <span>{{ t('settings.openaiModel') }}</span>
        <input v-model="openaiModel" placeholder="gpt-4.1-mini" />
      </label>
      <label v-if="agentProvider === 'pi'">
        <span>{{ t('settings.piApiKey') }}</span>
        <input v-model="piApiKey" type="password" placeholder="API Key" />
      </label>
    </section>

    <section class="card setting-section">
      <h3>{{ t('settings.music') }}</h3>
      <label>
        <span>{{ t('settings.musicProvider') }}</span>
        <select :value="musicProvider" @change="onMusicChange">
          <option value="netease">{{ t('settings.netease') }}</option>
        </select>
      </label>
      <label>
        <span>{{ t('settings.neteaseBaseUrl') }}</span>
        <input v-model="neteaseBaseUrl" placeholder="http://127.0.0.1:3000" />
      </label>
    </section>

    <section class="card setting-section">
      <h3>{{ t('settings.ui') }}</h3>
      <label>
        <span>{{ t('settings.language') }}</span>
        <select :value="locale" @change="onLocaleChange">
          <option v-for="item in supportedLocales" :key="item.value" :value="item.value">{{ item.label }}</option>
        </select>
      </label>
      <p class="hint">{{ t('settings.themeHint') }}</p>
    </section>

    <div class="save-bar">
      <span class="save-status">{{ status }}</span>
      <button @click="onSave">{{ t('settings.save') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSettingsStore } from '../stores/settings.store'
import { locale, setLocale, supportedLocales, useI18nText } from '../i18n'
import type { Locale } from '../i18n/messages'

const store = useSettingsStore()
const { t } = useI18nText()

const agentProvider = ref<'openai' | 'pi'>('openai')
const musicProvider = ref<'netease'>('netease')
const neteaseBaseUrl = ref('http://127.0.0.1:3000')
const openaiBaseUrl = ref('https://api.openai.com/v1')
const openaiApiKey = ref('')
const openaiModel = ref('gpt-4.1-mini')
const piApiKey = ref('')
const status = ref('')

onMounted(async () => {
  agentProvider.value = ((await store.loadSetting('agent.provider')) as 'openai' | 'pi' | null) ?? 'openai'
  musicProvider.value = ((await store.loadSetting('music.provider')) as 'netease' | null) ?? 'netease'
  neteaseBaseUrl.value = (await store.loadSetting('music.netease.baseUrl')) || 'http://127.0.0.1:3000'
  openaiBaseUrl.value = (await store.loadSetting('agent.openai.baseUrl')) || 'https://api.openai.com/v1'
  openaiApiKey.value = (await store.loadSetting('agent.openai.apiKey')) || ''
  openaiModel.value = (await store.loadSetting('agent.openai.model')) || 'gpt-4.1-mini'
  piApiKey.value = (await store.loadSetting('agent.pi.apiKey')) || ''
})

function onAgentChange(e: Event) {
  agentProvider.value = (e.target as HTMLSelectElement).value as 'openai' | 'pi'
}

function onMusicChange(e: Event) {
  musicProvider.value = (e.target as HTMLSelectElement).value as 'netease'
}

async function onLocaleChange(e: Event) {
  await setLocale((e.target as HTMLSelectElement).value as Locale)
}

async function onSave() {
  status.value = ''
  await store.saveSetting('agent.provider', agentProvider.value)
  await store.saveSetting('music.provider', musicProvider.value)
  await store.saveSetting('music.netease.baseUrl', neteaseBaseUrl.value.trim())
  await store.saveSetting('agent.openai.baseUrl', openaiBaseUrl.value.trim())
  await store.saveSetting('agent.openai.model', openaiModel.value.trim())
  if (openaiApiKey.value.trim()) {
    await store.saveSetting('agent.openai.apiKey', openaiApiKey.value.trim())
  }
  if (piApiKey.value) {
    await store.saveSetting('agent.pi.apiKey', piApiKey.value)
  }
  status.value = t('settings.saved')
}
</script>

<style scoped>
h1 {
  margin: 0 0 20px 0;
  font-weight: 550;
}
.setting-section {
  padding: 18px;
  margin-bottom: 16px;
}
.setting-section h3 {
  margin: 0 0 14px 0;
}
label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
label span {
  font-size: 14px;
}
select,
input {
  border: 1px solid #ded6c8;
  border-radius: 8px;
  padding: 6px 10px;
  background: #fffdfa;
  min-width: 200px;
}
.hint {
  color: #a39c8e;
  font-size: 13px;
  margin: 0;
}
.save-bar {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.save-status {
  color: #746d63;
  font-size: 13px;
}
.save-bar button {
  border: 1px solid #ddd4c7;
  background: #f8f4ec;
  color: #3d382f;
  border-radius: 10px;
  padding: 10px 24px;
  cursor: pointer;
  font-size: 15px;
}
</style>
