<template>
  <section class="ot-page-full flex h-full min-h-0 flex-col gap-4">
    <header class="ot-page-header mb-0 shrink-0">
      <div>
        <p class="ot-label">Listen</p>
        <h1 class="ot-page-title">音乐库</h1>
      </div>
      <p class="text-sm text-muted">{{ resultHint }}</p>
    </header>

    <div class="ot-audio-workbench flex min-h-0 flex-1 flex-col">
      <div class="ot-audio-header">
        <div class="min-w-0 flex-1">
          <p class="text-xs font-medium uppercase tracking-[0.08em] text-muted">Search</p>
          <form class="mt-2 flex gap-3" @submit.prevent="music.search">
            <Input v-model="music.query" class="h-11 flex-1 rounded-full border-0 bg-white/5 px-4 shadow-none focus-visible:ring-2" placeholder="搜索歌曲、歌手、专辑" />
            <Button class="min-w-20 rounded-full" :disabled="music.loading">
              {{ music.loading ? '加载中' : '搜索' }}
            </Button>
          </form>
        </div>
        <div class="hidden w-52 shrink-0 lg:block">
          <div class="ot-waveform" aria-hidden="true">
            <span v-for="bar in waveformBars" :key="bar" :style="{ height: `${bar}px` }" />
          </div>
        </div>
      </div>

      <div v-if="music.error" class="border-b border-line/10 p-5">
        <Card class="ot-action-tile flex items-center justify-between gap-5 p-5">
          <div>
            <p class="text-sm font-medium text-ink">音乐服务未连接</p>
            <p class="mt-2 text-sm leading-6 text-muted">检查网易云 API。</p>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" :disabled="music.loading" @click="music.loadDiscovery()">重试</Button>
            <Button variant="outline" @click="router.push('/settings')">设置</Button>
          </div>
        </Card>
      </div>

      <div v-else class="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)_300px] max-[1280px]:grid-cols-[220px_minmax(0,1fr)]">
        <aside class="min-h-0 overflow-y-auto bg-soft/30">
          <div class="border-b border-line/10 p-4">
            <Button
              variant="ghost"
              class="h-auto w-full justify-between rounded-xl bg-white/5 px-3 py-3 text-left hover:bg-white/10"
              :data-active="!music.query && music.activeListTitle === '推荐新歌' || undefined"
              @click="music.showNewSongs()"
            >
              <span>推荐新歌</span>
              <small>{{ music.discovery?.newSongs.length ?? 0 }} 首</small>
            </Button>
          </div>

          <section class="border-b border-line/10 p-4">
            <p class="ot-label">热搜</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <Button
                v-for="keyword in hotKeywords"
                :key="keyword"
                variant="secondary"
                size="sm"
                class="rounded-full bg-white/[0.08] text-ink hover:bg-white/[0.12]"
                @click="searchKeyword(keyword)"
              >
                {{ keyword }}
              </Button>
            </div>
          </section>

          <section class="border-b border-line/10 p-4">
            <p class="ot-label">热门歌单</p>
            <button
              v-for="list in music.discovery?.playlists ?? []"
              :key="`playlist-${list.sourceId}`"
              class="ot-list-card mt-3"
              :data-active="music.activeListTitle === list.title || undefined"
              @click="music.openList(list)"
            >
              <img v-if="list.coverUrl" :src="list.coverUrl" alt="" />
              <div v-else class="ot-soft-surface grid h-10 w-10 place-items-center rounded-md text-muted">♪</div>
              <span>{{ list.title }}</span>
            </button>
          </section>

          <section class="p-4">
            <p class="ot-label">排行榜</p>
            <button
              v-for="list in music.discovery?.charts ?? []"
              :key="`chart-${list.sourceId}`"
              class="ot-list-card mt-3"
              :data-active="music.activeListTitle === list.title || undefined"
              @click="music.openList(list)"
            >
              <img v-if="list.coverUrl" :src="list.coverUrl" alt="" />
              <div v-else class="ot-soft-surface grid h-10 w-10 place-items-center rounded-md text-muted">#</div>
              <span>{{ list.title }}</span>
            </button>
          </section>
        </aside>

        <section class="flex min-h-0 min-w-0 flex-col border-x border-line/10">
          <div class="flex items-center justify-between border-b border-line/10 px-5 py-3">
            <div>
              <p class="text-sm font-semibold text-ink">{{ music.query ? `搜索：${music.query}` : music.activeListTitle }}</p>
              <p class="mt-1 text-xs text-muted">{{ music.visibleTracks.length }} 首</p>
            </div>
            <button v-if="music.query" class="text-xs text-muted hover:text-accent" @click="music.clearSearch()">清空搜索</button>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto p-3">
            <p v-if="music.loading" class="p-5 text-sm text-muted">加载中</p>
            <p v-else-if="music.visibleTracks.length === 0" class="p-5 text-sm text-muted">
              没有歌曲
            </p>
            <TrackSearchResult
              v-for="track in music.visibleTracks"
              :key="`${track.source}:${track.sourceId}`"
              :track="track"
              :active="music.currentTrack?.sourceId === track.sourceId"
              @select="music.selectTrack(track)"
            />
          </div>
        </section>

        <aside class="min-h-0 min-w-0 overflow-y-auto bg-card/25 max-[1280px]:hidden">
          <div class="border-b border-line/10 px-5 py-3">
            <p class="text-sm font-semibold text-ink">当前歌曲</p>
            <p class="mt-1 text-xs text-muted">{{ music.currentTrack ? selectedDuration : '未选择' }}</p>
          </div>

          <div v-if="music.currentTrack" class="grid gap-4 p-5">
            <div class="flex gap-4">
              <img
                v-if="music.currentTrack.coverUrl"
                :src="music.currentTrack.coverUrl"
                class="h-28 w-28 rounded-lg object-cover"
                alt=""
              />
              <div v-else class="ot-soft-surface grid h-28 w-28 place-items-center rounded-lg text-2xl text-muted">♪</div>
              <div class="min-w-0">
                <p class="truncate text-lg font-semibold text-ink">{{ music.currentTrack.title }}</p>
                <p class="mt-1 truncate text-sm text-muted">{{ music.currentTrack.artist || '未知歌手' }}</p>
                <p v-if="music.currentTrack.album" class="mt-3 truncate text-xs text-muted">{{ music.currentTrack.album }}</p>
                <p class="mt-3 text-xs text-muted">{{ selectedDuration }}</p>
              </div>
            </div>

            <div class="rounded-xl bg-white/5 p-4">
              <p class="text-sm font-medium text-ink">{{ music.playableUrl ? '可播放' : '无法播放' }}</p>
              <p class="mt-2 text-sm leading-6 text-muted">
                {{ music.playableUrl ? '底部播放器已就绪' : '仍可分析' }}
              </p>
            </div>

            <div class="rounded-xl bg-white/5 p-4">
              <p class="ot-label">Lyric</p>
              <pre v-if="music.lyric" class="mt-3 max-h-[250px] whitespace-pre-wrap text-sm leading-7 text-muted">{{ music.lyric }}</pre>
              <p v-else class="mt-3 text-sm text-muted">无歌词</p>
            </div>

            <Button class="w-full" @click="router.push('/analysis')">AI 分析</Button>
          </div>

          <div v-else class="p-5">
            <Card class="ot-action-tile p-5">
              <p class="text-sm font-medium text-ink">未选择歌曲</p>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import TrackSearchResult from '../components/music/TrackSearchResult.vue'
import { useMusicStore } from '../stores/music.store'

const router = useRouter()
const music = useMusicStore()
const fallbackKeywords = ['周杰伦', '蔡依林', '宇多田光', 'city pop', '纯音乐', 'R&B']
const waveformBars = [14, 24, 18, 32, 26, 16, 30, 20, 28, 36, 18, 24, 14, 30, 22, 16, 34, 20]

const hotKeywords = computed(() => {
  const fromApi = music.discovery?.hotSearches ?? []
  return fromApi.length ? fromApi.slice(0, 10) : fallbackKeywords
})
const resultHint = computed(() => {
  if (music.loading) return '正在连接网易云 API'
  return `${music.visibleTracks.length} 首歌曲`
})
const selectedDuration = computed(() => {
  if (!music.currentTrack) return ''
  const minutes = Math.floor(music.currentTrack.duration / 60)
  const seconds = music.currentTrack.duration % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

onMounted(() => {
  if (!music.discovery) void music.loadDiscovery()
})

async function searchKeyword(keyword: string) {
  music.query = keyword
  await music.search()
}
</script>
