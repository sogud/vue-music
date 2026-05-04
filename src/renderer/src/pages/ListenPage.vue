<template>
  <section class="mx-auto grid max-w-6xl gap-6 px-8 py-10">
    <header>
      <p class="ot-label">Listen</p>
      <h1 class="mt-2 text-3xl font-semibold text-ink">搜索和听歌</h1>
    </header>

    <div class="ot-card p-5">
      <form class="flex gap-3" @submit.prevent="music.search">
        <input v-model="music.query" class="ot-input flex-1" placeholder="输入歌名、歌手或关键词" />
        <button class="ot-button-primary" :disabled="music.loading">搜索</button>
      </form>
      <p v-if="music.error" class="mt-3 text-sm text-danger">{{ music.error }}</p>
    </div>

    <div v-if="music.error || (!music.currentTrack && music.results.length === 0)" class="rounded-lg border border-line/80 bg-card/70 p-5">
      <div class="flex items-center justify-between gap-5">
        <div>
          <p class="text-sm font-medium text-ink">需要先连接网易云 API</p>
          <p class="mt-2 text-sm leading-6 text-muted">
            OtoDesk 不显示假歌曲。开发时运行 `npm run dev:all` 会同时启动网易云 API 和桌面端。
          </p>
        </div>
        <button class="ot-button" @click="router.push('/settings')">打开设置</button>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div class="grid content-start gap-3">
        <p v-if="!music.loading && music.query && music.results.length === 0" class="ot-card p-5 text-sm text-muted">
          没有找到相关歌曲。
        </p>
        <TrackSearchResult
          v-for="track in music.results"
          :key="`${track.source}:${track.sourceId}`"
          :track="track"
          @select="music.selectTrack(track)"
        />
      </div>

      <aside class="grid content-start gap-4">
        <MiniPlayer :track="music.currentTrack" :playable-url="music.playableUrl" />
        <div class="ot-card p-5">
          <p class="ot-label">Lyric</p>
          <pre v-if="music.lyric" class="mt-3 max-h-[360px] whitespace-pre-wrap text-sm leading-7 text-muted">{{ music.lyric }}</pre>
          <p v-else class="mt-3 text-sm text-muted">未获取到歌词，AI 将基于歌曲信息分析。</p>
          <button class="ot-button-primary mt-5" :disabled="!music.currentTrack" @click="router.push('/analysis')">
            AI 分析当前歌曲
          </button>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import TrackSearchResult from '../components/music/TrackSearchResult.vue'
import MiniPlayer from '../components/music/MiniPlayer.vue'
import { useMusicStore } from '../stores/music.store'

const router = useRouter()
const music = useMusicStore()
</script>
