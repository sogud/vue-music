<template>
  <section class="ot-page flex h-full min-h-0 flex-col">
    <header class="ot-page-header shrink-0">
      <div>
        <p class="ot-label">Settings</p>
        <h1 class="ot-page-title">系统配置</h1>
      </div>
      <p class="text-sm text-muted">AI / 音乐 / 渲染</p>
    </header>

    <div class="grid min-h-0 flex-1 grid-cols-[minmax(250px,0.72fr)_minmax(0,1.28fr)] gap-5 overflow-hidden max-[1120px]:grid-cols-1">
      <div class="grid min-h-0 content-start gap-4 overflow-y-auto pr-1">
        <Card class="p-4">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="ot-label">Quick Start</p>
              <h2 class="mt-1 text-base font-semibold text-ink">默认值</h2>
            </div>
            <Button variant="outline" @click="applyDefaults">恢复</Button>
          </div>
          <code class="ot-terminal mt-3 block rounded-lg px-3 py-2 text-xs">npm run dev:web</code>
        </Card>

        <Card class="p-4">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="ot-label">Appearance</p>
              <h2 class="mt-1 text-base font-semibold text-ink">显示</h2>
            </div>
            <div class="flex items-center gap-2 text-sm text-muted">
              <span>Light</span>
              <Switch :checked="theme.mode === 'dark'" @update:checked="setDarkMode" />
              <span>Dark</span>
            </div>
          </div>
        </Card>

        <Card class="p-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="ot-label">Audio Renderer</p>
              <h2 class="mt-1 text-base font-semibold text-ink">内置渲染</h2>
            </div>
            <Button variant="outline" @click="settings.testRenderer">测试</Button>
          </div>
          <p v-if="settings.rendererStatus?.message" class="mt-3 text-sm text-danger">{{ settings.rendererStatus.message }}</p>
          <Badge v-else-if="settings.rendererStatus?.canRender" variant="secondary" class="mt-3">可用</Badge>

          <details class="mt-3 text-sm text-muted">
            <summary class="cursor-pointer select-none text-ink">自定义路径</summary>
            <div class="mt-3 grid gap-2">
              <Input v-model="form.fluidSynthPath" placeholder="/path/to/fluidsynth" />
              <Input v-model="form.soundFontPath" placeholder="/path/to/soundfont.sf2" />
              <div class="flex gap-2">
                <Button variant="outline" @click="saveRenderer">保存</Button>
                <Button variant="outline" @click="resetRendererDefaults">清空</Button>
              </div>
            </div>
          </details>
        </Card>

        <Card class="p-4">
          <p class="ot-label">NeteaseCloudMusicApi</p>
          <div class="mt-3 flex gap-2">
            <Input v-model="form.neteaseBaseUrl" class="min-w-0 flex-1" placeholder="http://127.0.0.1:39271" />
            <Button variant="outline" @click="saveNetease">保存</Button>
          </div>
          <div class="mt-3 flex items-center gap-3">
            <Button variant="outline" @click="settings.testNetease">测试连接</Button>
            <span class="min-w-0 truncate text-sm text-muted">{{ settings.neteaseTest }}</span>
          </div>
        </Card>
      </div>

      <Card class="min-h-0 overflow-y-auto p-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="ot-label">AI Backend</p>
            <h2 class="mt-1 text-lg font-semibold text-ink">AI SDK</h2>
          </div>
          <Button @click="saveAiAndTest">保存并测试</Button>
        </div>

        <div class="mt-5 grid gap-3 md:grid-cols-2">
          <label class="block text-sm text-muted">
            服务
            <Select v-model="form.aiProvider" @update:model-value="applyAiPreset">
              <SelectTrigger class="mt-1.5 w-full">
                <SelectValue placeholder="选择服务" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="google">Gemini</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="deepseek">DeepSeek</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
                <SelectItem value="local">OpenAI-compatible / Local</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label class="block text-sm text-muted">
            Model
            <Input
              v-model="form.aiModel"
              class="mt-1.5"
              :list="form.aiProvider === 'openrouter' ? 'openrouter-free-models' : undefined"
              :placeholder="currentAiPreset.model"
            />
            <datalist id="openrouter-free-models">
              <option v-for="model in openRouterModels" :key="model.id" :value="model.id">{{ model.name }}</option>
            </datalist>
          </label>
          <label class="block text-sm text-muted md:col-span-2">
            API Key
            <Input
              v-model="form.aiApiKey"
              class="mt-1.5"
              type="password"
              placeholder="留空表示沿用已保存 key"
            />
          </label>
          <label class="block text-sm text-muted md:col-span-2">
            Endpoint
            <Input v-model="form.aiBaseUrl" class="mt-1.5" :placeholder="currentAiPreset.baseUrl" />
          </label>
        </div>

        <div class="mt-4 rounded-2xl bg-white/[0.055] p-3 text-sm leading-6 text-muted shadow-[inset_0_0_0_1px_rgb(var(--ot-line)/0.08)]">
          <p class="font-medium text-ink">{{ currentAiPreset.title }}</p>
          <p>{{ currentAiPreset.hint }}</p>
          <div v-if="form.aiProvider === 'openrouter'" class="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" :disabled="openRouterBusy" @click="startOpenRouterLogin">
              {{ openRouterBusy ? '连接中' : 'OpenRouter 登录' }}
            </Button>
            <Button variant="outline" size="sm" :disabled="openRouterBusy" @click="loadOpenRouterFreeModels">
              刷新免费模型
            </Button>
            <span class="text-xs text-muted">{{ openRouterStatus }}</span>
          </div>
        </div>

        <div class="mt-4 flex items-center gap-3 rounded-lg bg-soft/60 px-3 py-2">
          <span class="h-2 w-2 shrink-0 rounded-full" :class="settings.aiTest.includes('正常') ? 'bg-[#6DBB87]' : 'bg-accent/70'" />
          <span class="min-w-0 truncate text-sm text-muted">{{ settings.aiTest || '未测试' }}</span>
        </div>
      </Card>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { settingKeys, useSettingsStore } from '../stores/settings.store'
import { useThemeStore } from '../stores/theme.store'

const settings = useSettingsStore()
const theme = useThemeStore()
const aiPresets = {
  openai: {
    title: 'OpenAI',
    model: 'gpt-4o-mini',
    baseUrl: '留空',
    hint: '填 API Key'
  },
  google: {
    title: 'Gemini',
    model: 'gemini-2.5-flash',
    baseUrl: '留空',
    hint: '填 API Key'
  },
  anthropic: {
    title: 'Anthropic',
    model: 'claude-sonnet-4-5',
    baseUrl: '留空',
    hint: '填 API Key'
  },
  deepseek: {
    title: 'DeepSeek',
    model: 'deepseek-chat',
    baseUrl: '留空',
    hint: '填 API Key'
  },
  openrouter: {
    title: 'OpenRouter',
    model: 'deepseek/deepseek-v4-flash:free',
    baseUrl: '留空',
    hint: '可手动填 key，也可以点击 OpenRouter 登录自动换取 key。'
  },
  local: {
    title: '兼容端点',
    model: 'qwen2.5-coder:7b',
    baseUrl: 'http://localhost:1234/v1',
    hint: '填 Endpoint'
  }
} as const

type AiProvider = keyof typeof aiPresets

const form = reactive({
  neteaseBaseUrl: '',
  aiProvider: 'openai',
  aiModel: 'gpt-4o-mini',
  aiApiKey: '',
  aiBaseUrl: '',
  fluidSynthPath: '',
  soundFontPath: ''
})
const currentAiPreset = computed(() => aiPresets[(form.aiProvider as AiProvider) in aiPresets ? (form.aiProvider as AiProvider) : 'openai'])
const openRouterBusy = ref(false)
const openRouterStatus = ref('未连接')
const openRouterModels = ref<Array<{ id: string; name: string }>>([])

async function applyDefaults() {
  form.neteaseBaseUrl = 'http://127.0.0.1:39271'
  form.aiProvider = 'openai'
  form.aiModel = 'gpt-4o-mini'
  form.aiApiKey = ''
  form.aiBaseUrl = ''
  form.fluidSynthPath = ''
  form.soundFontPath = ''
  await Promise.all([saveNetease(), saveAi(), saveRenderer()])
}

onMounted(async () => {
  await settings.load()
  await theme.load()
  form.neteaseBaseUrl = settings.values[settingKeys.neteaseBaseUrl] ?? 'http://127.0.0.1:39271'
  form.aiProvider = settings.values[settingKeys.aiProvider] ?? 'openai'
  form.aiModel = settings.values[settingKeys.aiModel] ?? 'gpt-4o-mini'
  form.aiBaseUrl = settings.values[settingKeys.aiBaseUrl] ?? ''
  form.fluidSynthPath = settings.values[settingKeys.fluidSynthPath] ?? ''
  form.soundFontPath = settings.values[settingKeys.soundFontPath] ?? ''
  await Promise.all([loadOpenRouterFreeModels(), finishOpenRouterLogin()])
})

function applyAiPreset() {
  const preset = currentAiPreset.value
  form.aiModel = preset.model
  if (form.aiProvider !== 'local') form.aiBaseUrl = ''
  if (form.aiProvider === 'local' && !form.aiBaseUrl) form.aiBaseUrl = preset.baseUrl
}

async function setDarkMode(value: boolean) {
  await theme.setMode(value ? 'dark' : 'light')
}

async function saveNetease() {
  await settings.set(settingKeys.neteaseBaseUrl, form.neteaseBaseUrl)
}

async function saveAi() {
  await settings.configureAi({
    provider: form.aiProvider,
    model: form.aiModel,
    apiKey: form.aiApiKey || undefined,
    baseUrl: form.aiBaseUrl
  })
  form.aiApiKey = ''
}

async function saveAiAndTest() {
  await saveAi()
  await settings.testAi()
}

async function loadOpenRouterFreeModels() {
  try {
    const result = await settings.listOpenRouterFreeModels()
    openRouterModels.value = result.models.slice(0, 120)
    if (result.models[0]?.id && form.aiProvider === 'openrouter') {
      const current = form.aiModel.trim()
      if (!current || current === 'openai/gpt-4o-mini') form.aiModel = result.models[0].id
    }
  } catch {
    openRouterModels.value = []
  }
}

function randomBase64Url(byteLength: number) {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function createCodeChallenge(verifier: string) {
  const data = new TextEncoder().encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  let binary = ''
  for (const byte of new Uint8Array(hash)) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function startOpenRouterLogin() {
  openRouterBusy.value = true
  openRouterStatus.value = '跳转 OpenRouter'
  try {
    const verifier = randomBase64Url(64)
    const challenge = await createCodeChallenge(verifier)
    sessionStorage.setItem('oto-openrouter-code-verifier', verifier)

    const callbackUrl = `${window.location.origin}${window.location.pathname}#/settings`
    const authUrl = new URL('https://openrouter.ai/auth')
    authUrl.searchParams.set('callback_url', callbackUrl)
    authUrl.searchParams.set('code_challenge', challenge)
    authUrl.searchParams.set('code_challenge_method', 'S256')
    window.location.href = authUrl.toString()
  } catch (error) {
    openRouterStatus.value = error instanceof Error ? error.message : String(error)
    openRouterBusy.value = false
  }
}

function readOpenRouterCode() {
  const searchCode = new URLSearchParams(window.location.search).get('code')
  if (searchCode) return searchCode
  const hashQuery = window.location.hash.split('?')[1]
  return hashQuery ? new URLSearchParams(hashQuery).get('code') : null
}

async function finishOpenRouterLogin() {
  const code = readOpenRouterCode()
  if (!code) return

  const verifier = sessionStorage.getItem('oto-openrouter-code-verifier')
  if (!verifier) {
    openRouterStatus.value = '登录校验缺失，请重新登录'
    return
  }

  openRouterBusy.value = true
  openRouterStatus.value = '正在换取 key'
  try {
    const result = await settings.exchangeOpenRouterCode({ code, codeVerifier: verifier })
    form.aiProvider = 'openrouter'
    form.aiBaseUrl = ''
    if (!form.aiModel.trim() || form.aiModel === 'openai/gpt-4o-mini') {
      form.aiModel = openRouterModels.value[0]?.id || aiPresets.openrouter.model
    }
    await settings.configureAi({
      provider: 'openrouter',
      model: form.aiModel,
      apiKey: result.key,
      baseUrl: ''
    })
    await settings.testAi()
    openRouterStatus.value = '已连接'
    sessionStorage.removeItem('oto-openrouter-code-verifier')
  } catch (error) {
    openRouterStatus.value = error instanceof Error ? error.message : String(error)
  } finally {
    openRouterBusy.value = false
    window.history.replaceState({}, document.title, `${window.location.origin}${window.location.pathname}#/settings`)
  }
}

async function saveRenderer() {
  await settings.set(settingKeys.fluidSynthPath, form.fluidSynthPath)
  await settings.set(settingKeys.soundFontPath, form.soundFontPath)
}

async function resetRendererDefaults() {
  form.fluidSynthPath = ''
  form.soundFontPath = ''
  await saveRenderer()
  await settings.testRenderer()
}
</script>
