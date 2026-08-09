<template>
  <div class="ot-app h-screen overflow-hidden text-ink">
    <div class="ot-shell" :class="{ 'ot-shell-no-context': !contextVisible }">
      <aside class="ot-sidebar">
        <RouterLink to="/" class="ot-brand" title="首页">
          <div class="ot-brand-mark">
            <Music2 class="h-4 w-4" :stroke-width="1.9" />
          </div>
          <span>oto</span>
        </RouterLink>

        <nav class="ot-nav">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="ot-nav-link"
            active-class="ot-nav-active"
            :title="item.label"
          >
            <component :is="item.icon" class="h-4 w-4 shrink-0" :stroke-width="1.8" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>

        <div class="ot-sidebar-status" :title="assistantStatus">
          <span class="h-2.5 w-2.5 bg-[#30a279]" />
        </div>
      </aside>

      <header class="ot-topbar">
        <div class="min-w-0">
          <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{{ currentPage.kicker }}</p>
          <p class="mt-0.5 truncate text-sm font-semibold text-ink">{{ currentPage.label }}</p>
        </div>

        <form class="ot-searchbar" @submit.prevent="submitSearch">
          <Search class="h-4 w-4 shrink-0 text-muted" :stroke-width="1.8" />
          <Input
            v-model="music.query"
            class="h-auto min-w-0 flex-1 border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
            placeholder="搜索歌曲、艺术家、歌词"
          />
        </form>

        <div class="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" class="h-9 w-9 text-muted" title="设置" @click="router.push('/settings')">
            <Settings class="h-4 w-4" :stroke-width="1.8" />
          </Button>
          <Button variant="ghost" size="icon" class="h-9 w-9 rounded-full text-muted" @click="theme.toggle">
            <Moon v-if="theme.mode === 'dark'" class="h-4 w-4" :stroke-width="1.8" />
            <Sun v-else class="h-4 w-4" :stroke-width="1.8" />
          </Button>
        </div>
      </header>

      <main class="ot-main">
        <RouterView />
      </main>

      <aside v-if="contextVisible" class="ot-context-panel">
        <div>
          <p class="ot-label">Context</p>
          <h2 class="mt-1 text-base font-semibold text-ink">当前线索</h2>
        </div>

        <section class="ot-panel mt-4 p-4">
          <div class="flex gap-3">
            <img
              v-if="music.currentTrack?.coverUrl"
              :src="music.currentTrack.coverUrl"
              class="h-16 w-16 rounded-lg object-cover"
              alt=""
            />
            <div v-else class="ot-soft-surface grid h-16 w-16 place-items-center rounded-lg text-muted">♪</div>
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-ink">{{ music.currentTrack?.title ?? '未选择歌曲' }}</p>
              <p class="mt-1 truncate text-xs text-muted">{{ music.currentTrack?.artist ?? '从听歌开始' }}</p>
              <p class="mt-3 text-xs text-muted">{{ music.playableUrl ? '可播放' : music.currentTrack ? '可分析' : '等待选择' }}</p>
            </div>
          </div>

          <div v-if="analysis.current" class="mt-4 flex flex-wrap gap-2">
            <Badge v-for="tag in analysis.current.moodTags.slice(0, 5)" :key="tag" variant="secondary">{{ tag }}</Badge>
          </div>
        </section>

        <section class="mt-5">
          <p class="ot-label">Next</p>
          <div class="mt-3 grid gap-2">
            <button class="ot-quick-row" @click="router.push('/listen')">
              <SquarePlay class="h-4 w-4" :stroke-width="1.8" />
              <span>选择歌曲</span>
            </button>
            <button class="ot-quick-row" @click="router.push('/analysis')">
              <ChartNoAxesColumnIncreasing class="h-4 w-4" :stroke-width="1.8" />
              <span>分析当前歌曲</span>
            </button>
            <button class="ot-quick-row" @click="router.push('/composer')">
              <PencilLine class="h-4 w-4" :stroke-width="1.8" />
              <span>进入创作台</span>
            </button>
          </div>
        </section>
      </aside>

      <footer class="ot-footer">
        <div class="flex min-w-0 items-center gap-3">
          <img
            v-if="music.currentTrack?.coverUrl"
            :src="music.currentTrack.coverUrl"
            class="h-12 w-12 rounded-lg object-cover"
            :class="music.playableUrl ? 'ot-cover-playing' : ''"
            alt=""
          />
          <div v-else class="ot-soft-surface grid h-12 w-12 place-items-center rounded-lg text-muted">
            <Music2 class="h-5 w-5" :stroke-width="1.8" />
          </div>
          <div>
            <p class="truncate text-sm font-medium text-ink">{{ music.currentTrack?.title ?? '未播放' }}</p>
            <p class="truncate text-xs text-muted">{{ music.currentTrack?.artist ?? '选择歌曲' }}</p>
          </div>
        </div>
        <MediaChromePlayer
          v-if="music.playableUrl"
          class="mx-auto max-w-[720px]"
          :src="music.playableUrl"
          :title="music.currentTrack?.title"
          :artist="music.currentTrack?.artist"
          :autoplay-token="music.playbackNonce"
          @ended="music.playNext()"
        />
        <div v-else class="ot-player-empty">
          <button class="ot-play-button grid h-11 w-11 place-items-center rounded-full" disabled>
            <Play class="h-5 w-5 fill-current" :stroke-width="1.8" />
          </button>
          <span class="text-sm text-muted">
            {{ music.currentTrack ? '不可播放，可分析' : '未选择歌曲' }}
          </span>
        </div>
        <button class="grid h-9 w-9 place-items-center justify-self-end rounded-full text-muted hover:bg-soft/70">
          <Menu class="h-4 w-4" :stroke-width="1.8" />
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMusicStore } from '../../stores/music.store'
import { useAnalysisStore } from '../../stores/analysis.store'
import { useThemeStore } from '../../stores/theme.store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import MediaChromePlayer from '../music/MediaChromePlayer.vue'
import {
  ChartNoAxesColumnIncreasing,
  Menu,
  Moon,
  Music2,
  PencilLine,
  Play,
  Search,
  Settings,
  SquarePlay,
  Sun
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const music = useMusicStore()
const analysis = useAnalysisStore()
const theme = useThemeStore()

const navItems = [
  { to: '/listen', label: '听歌', icon: SquarePlay },
  { to: '/composer', label: '创作台', icon: PencilLine }
]

const pageLabels: Record<string, { kicker: string; label: string }> = {
  '/': { kicker: 'Home', label: '首页' },
  '/listen': { kicker: 'Library', label: '听歌' },
  '/inspiration': { kicker: 'Ideas', label: '灵感' },
  '/composer': { kicker: 'Create', label: '创作台' },
  '/settings': { kicker: 'System', label: '设置' }
}

const currentPage = computed(() => {
  const current = navItems.find((item) => item.to === route.path)
  return pageLabels[route.path] ?? { kicker: current ? 'Workspace' : 'oto', label: current?.label ?? 'oto' }
})
const assistantStatus = computed(() => {
  if (music.loading) return '搜索中'
  if (music.error) return '音乐服务未连接'
  return '准备完毕'
})
const contextVisible = computed(() => !['listen', 'composer', 'settings'].includes(String(route.name)))

async function submitSearch() {
  await music.search()
  router.push('/listen')
}
</script>
