<template>
  <section class="mx-auto max-w-4xl px-8 py-10">
    <header>
      <p class="ot-label">Settings</p>
      <h1 class="mt-2 text-3xl font-semibold text-ink">系统配置</h1>
    </header>

    <div class="mt-8 grid gap-5">
      <section class="ot-card p-5">
        <p class="ot-label">Quick start</p>
        <h2 class="mt-2 text-lg font-semibold text-ink">开箱即用启动</h2>
        <p class="mt-3 text-sm leading-7 text-muted">
          开发模式只需要运行一条命令：它会同时启动 NeteaseCloudMusicApi 后端和 Electron 桌面端。
        </p>
        <div class="mt-4 flex items-center gap-3">
          <code class="ot-terminal rounded-lg px-4 py-3 text-xs">npm run dev:all</code>
          <button class="ot-button" @click="applyDefaults">恢复默认配置</button>
        </div>
      </section>

      <section class="ot-card p-5">
        <p class="ot-label">Appearance</p>
        <h2 class="mt-2 text-lg font-semibold text-ink">显示模式</h2>
        <div class="mt-4 inline-flex rounded-lg border border-line bg-card p-1">
          <button
            class="rounded-md px-4 py-2 text-sm"
            :class="theme.mode === 'light' ? 'bg-accent text-white' : 'text-muted hover:text-ink'"
            @click="theme.setMode('light')"
          >
            Light
          </button>
          <button
            class="rounded-md px-4 py-2 text-sm"
            :class="theme.mode === 'dark' ? 'bg-accent text-white' : 'text-muted hover:text-ink'"
            @click="theme.setMode('dark')"
          >
            Dark
          </button>
        </div>
        <p class="mt-3 text-sm text-muted">代码编辑器和命令提示区域会同步切换。</p>
      </section>

      <section class="ot-card p-5">
        <p class="ot-label">NeteaseCloudMusicApi</p>
        <p class="mt-2 text-sm leading-6 text-muted">
          默认由 `npm run dev:all` 启动在 127.0.0.1:3000。通常不需要手动改。
        </p>
        <label class="mt-4 block text-sm text-muted">Base URL</label>
        <input v-model="form.neteaseBaseUrl" class="ot-input mt-2 w-full" placeholder="http://127.0.0.1:3000" />
        <div class="mt-4 flex items-center gap-3">
          <button class="ot-button-primary" @click="saveNetease">保存</button>
          <button class="ot-button" @click="settings.testNetease">测试 Netease</button>
          <span class="text-sm text-muted">{{ settings.neteaseTest }}</span>
        </div>
      </section>

      <section class="ot-card p-5">
        <p class="ot-label">AI Backend</p>
        <h2 class="mt-2 text-lg font-semibold text-ink">Pi coding-agent</h2>
        <p class="mt-3 text-sm leading-7 text-muted">
          OtoDesk 的 AI 后端是本机 `pi` CLI，不需要另启 HTTP 服务。先在终端确认 `pi --help` 可用，并让 Pi 自己配置好模型/API key，然后点击“测试 Pi”。
        </p>
        <div class="mt-4 grid gap-3 md:grid-cols-3">
          <input v-model="form.piCommand" class="ot-input" placeholder="pi" />
          <input v-model="form.piMode" class="ot-input" placeholder="rpc" />
          <input v-model="form.piWorkdir" class="ot-input" placeholder="工作目录，可选" />
        </div>
        <div class="mt-4 flex items-center gap-3">
          <button class="ot-button-primary" @click="savePi">保存</button>
          <button class="ot-button" @click="settings.testPi">测试 Pi</button>
          <span class="text-sm text-muted">{{ settings.piTest }}</span>
        </div>
        <div class="mt-4 rounded-lg border border-line bg-card/70 p-4 text-sm leading-7 text-muted">
          <p class="font-medium text-ink">最少配置路径</p>
          <p>1. 安装/确认 Pi：`which pi`</p>
          <p>2. 在 Pi 自己的配置里放好模型和 API key，例如 OpenAI / Gemini / Anthropic。</p>
          <p>3. OtoDesk 保持默认：command = `pi`，mode = `rpc`。</p>
        </div>
      </section>

      <section class="ot-card p-5">
        <p class="ot-label">FluidSynth</p>
        <div class="mt-4 grid gap-3 md:grid-cols-2">
          <input v-model="form.fluidSynthPath" class="ot-input" placeholder="fluidsynth" />
          <input v-model="form.soundFontPath" class="ot-input" placeholder="/path/to/soundfont.sf2" />
        </div>
        <div class="mt-4 flex items-center gap-3">
          <button class="ot-button-primary" @click="saveRenderer">保存</button>
          <button class="ot-button" @click="settings.testRenderer">测试渲染环境</button>
        </div>
        <p v-if="settings.rendererStatus?.message" class="mt-3 text-sm text-danger">{{ settings.rendererStatus.message }}</p>
        <p v-else-if="settings.rendererStatus?.canRender" class="mt-3 text-sm text-muted">渲染环境可用。</p>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { settingKeys, useSettingsStore } from '../stores/settings.store'
import { useThemeStore } from '../stores/theme.store'

const settings = useSettingsStore()
const theme = useThemeStore()
const form = reactive({
  neteaseBaseUrl: '',
  piCommand: '',
  piMode: 'rpc',
  piWorkdir: '',
  fluidSynthPath: '',
  soundFontPath: ''
})

async function applyDefaults() {
  form.neteaseBaseUrl = 'http://127.0.0.1:3000'
  form.piCommand = 'pi'
  form.piMode = 'rpc'
  form.piWorkdir = ''
  form.fluidSynthPath = 'fluidsynth'
  await Promise.all([saveNetease(), savePi(), saveRenderer()])
}

onMounted(async () => {
  await settings.load()
  await theme.load()
  form.neteaseBaseUrl = settings.values[settingKeys.neteaseBaseUrl] ?? 'http://127.0.0.1:3000'
  form.piCommand = settings.values[settingKeys.piCommand] ?? 'pi'
  form.piMode = settings.values[settingKeys.piMode] ?? 'rpc'
  form.piWorkdir = settings.values[settingKeys.piWorkdir] ?? ''
  form.fluidSynthPath = settings.values[settingKeys.fluidSynthPath] ?? 'fluidsynth'
  form.soundFontPath = settings.values[settingKeys.soundFontPath] ?? ''
})

async function saveNetease() {
  await settings.set(settingKeys.neteaseBaseUrl, form.neteaseBaseUrl)
}

async function savePi() {
  await settings.set(settingKeys.piCommand, form.piCommand)
  await settings.set(settingKeys.piMode, form.piMode)
  await settings.set(settingKeys.piWorkdir, form.piWorkdir)
}

async function saveRenderer() {
  await settings.set(settingKeys.fluidSynthPath, form.fluidSynthPath)
  await settings.set(settingKeys.soundFontPath, form.soundFontPath)
}
</script>
