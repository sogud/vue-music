<template>
  <section class="mx-auto max-w-5xl px-10 py-12">
    <p class="text-sm text-muted">贴近当前心情的音乐</p>
    <div class="mt-14">
      <h1 class="text-3xl font-light tracking-normal text-ink">早上好，今天想听什么？<span class="text-accent">☼</span></h1>
      <p class="mt-3 text-sm text-muted">先搜索真实歌曲，再让 Pi 分析和生成原创 composition。</p>
    </div>

    <article class="ot-feature-card mt-12">
      <div class="flex items-center gap-8">
        <img
          v-if="music.currentTrack?.coverUrl"
          :src="music.currentTrack.coverUrl"
          class="h-40 w-40 rounded-xl object-cover"
          alt=""
        />
        <div v-else class="ot-soft-surface grid h-40 w-40 place-items-center rounded-xl text-4xl text-muted">♪</div>
        <div class="min-w-0 flex-1">
          <p class="text-2xl font-medium text-ink">{{ music.currentTrack?.title ?? '连接 API 后选择一首歌' }}</p>
          <p class="mt-2 text-sm text-muted">{{ music.currentTrack?.artist ?? 'NeteaseCloudMusicApi 当前未提供歌曲数据' }}</p>
          <p class="mt-5 text-sm leading-7 text-muted">
            {{ music.currentTrack ? '可以继续分析、保存灵感或生成原创工程。' : '运行 npm run dev:all 后，在顶部搜索框输入歌名或歌手。' }}
          </p>
          <div class="mt-6 flex flex-wrap gap-2">
            <span class="ot-tag">真实搜索</span>
            <span class="ot-tag">AI 分析</span>
            <span class="ot-tag">MIDI</span>
            <span class="ot-tag">WAV</span>
          </div>
        </div>
        <button class="grid h-16 w-16 place-items-center rounded-full bg-accent text-2xl text-white shadow-[0_8px_24px_rgb(var(--ot-shadow)/0.18)]" @click="goPrimary">
          ▶
        </button>
      </div>
    </article>

    <section class="mt-14">
      <p class="text-sm text-muted">从灵感开始</p>
      <div class="mt-5 grid gap-5 md:grid-cols-2">
        <button class="ot-start-card text-left" @click="router.push('/listen')">
          <span class="text-xl">✧</span>
          <span class="mt-5 block text-base font-medium text-ink">AI 分析歌曲</span>
          <span class="mt-3 block text-sm leading-7 text-muted">搜索真实歌曲，分析情绪、风格、结构和创作关键词。</span>
          <span class="mt-7 block text-xl">→</span>
        </button>

        <button class="ot-start-card text-left" @click="router.push('/composer')">
          <span class="text-xl">✐</span>
          <span class="mt-5 block text-base font-medium text-ink">原创音乐工程</span>
          <span class="mt-3 block text-sm leading-7 text-muted">输入想法，让 Pi 生成可编辑 composition.json。</span>
          <span class="mt-7 block text-xl">→</span>
        </button>
      </div>
    </section>

    <section v-if="isEmpty" class="ot-api-card mt-10">
      <div>
        <p class="text-sm font-medium text-ink">为什么现在没有歌曲？</p>
        <p class="mt-2 text-sm leading-7 text-muted">OtoDesk 不内置假数据。开发时用一条命令同时启动网易云 API 和桌面端。</p>
      </div>
      <code class="ot-terminal rounded-lg px-4 py-3 text-xs">npm run dev:all</code>
      <button class="ot-button" @click="router.push('/settings')">检查设置</button>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicStore } from '../stores/music.store'
import { useProjectStore } from '../stores/project.store'
import { useInspirationStore } from '../stores/inspiration.store'

const router = useRouter()
const music = useMusicStore()
const projects = useProjectStore()
const inspirations = useInspirationStore()

const isEmpty = computed(() => !music.currentTrack && projects.items.length === 0 && inspirations.items.length === 0)

onMounted(async () => {
  await Promise.all([projects.load(), inspirations.load()])
})

function goPrimary() {
  router.push(music.currentTrack ? '/analysis' : '/listen')
}
</script>
