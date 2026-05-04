<template>
  <div class="ot-app min-h-screen text-ink">
    <div class="grid min-h-screen grid-cols-[210px_minmax(0,1fr)_360px] grid-rows-[92px_minmax(0,1fr)_96px]">
      <aside class="ot-sidebar row-span-3 border-r border-line/80 px-6 py-7">
        <div class="flex items-center gap-3">
          <div class="grid h-9 w-9 place-items-center rounded-full bg-card shadow-[0_1px_6px_rgb(var(--ot-shadow)/0.08)]">
            <span class="text-base font-semibold">◌</span>
          </div>
          <span class="text-lg font-medium tracking-tight">OtoDesk</span>
        </div>

        <nav class="mt-16 grid gap-2">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="group flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted transition hover:bg-card/80 hover:text-ink"
            active-class="bg-card text-ink shadow-[0_1px_8px_rgb(var(--ot-shadow)/0.08)]"
          >
            <span class="grid h-5 w-5 place-items-center text-base">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>

        <div class="absolute bottom-28 left-6 w-[162px] border-t border-line/70 pt-5">
          <p class="text-xs text-muted">今日状态</p>
          <div class="mt-2 flex items-center justify-between">
            <span class="text-sm font-medium text-ink">专注创作</span>
            <span class="text-base text-accent">☼</span>
          </div>
        </div>
      </aside>

      <header class="ot-topbar col-span-2 flex items-center justify-between border-b border-line/80 px-10 backdrop-blur">
        <form class="ot-surface mx-auto flex h-14 w-full max-w-[760px] items-center gap-3 rounded-2xl border border-line/90 px-5 shadow-[0_1px_10px_rgb(var(--ot-shadow)/0.05)]" @submit.prevent="submitSearch">
          <span class="text-lg text-muted">⌕</span>
          <input
            v-model="music.query"
            class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/55"
            placeholder="搜索歌曲、艺术家、歌词或灵感主题..."
          />
        </form>
        <div class="ml-8 flex items-center gap-5">
          <button class="grid h-10 w-10 place-items-center rounded-full text-xl text-muted hover:bg-card" @click="theme.toggle">
            {{ theme.mode === 'dark' ? '☾' : '☼' }}
          </button>
          <div class="h-10 w-10 rounded-full bg-accent/30 shadow-inner" />
        </div>
      </header>

      <main class="min-w-0 overflow-auto">
        <RouterView />
      </main>

      <aside class="ot-assistant row-span-2 border-l border-line/80 px-7 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-ink">助手</h2>
            <p class="mt-2 flex items-center gap-2 text-xs text-muted">
              <span class="h-1.5 w-1.5 rounded-full bg-[#6DBB87]" />
              {{ assistantStatus }}
            </p>
          </div>
        </div>

        <section class="ot-glass-card mt-7 p-4">
          <div class="flex gap-3">
            <img
              v-if="music.currentTrack?.coverUrl"
              :src="music.currentTrack.coverUrl"
              class="h-14 w-14 rounded-lg object-cover"
              alt=""
            />
            <div v-else class="ot-soft-surface grid h-14 w-14 place-items-center rounded-lg text-muted">♪</div>
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-ink">{{ music.currentTrack?.title ?? '还没有当前歌曲' }}</p>
              <p class="mt-1 truncate text-xs text-muted">{{ music.currentTrack?.artist ?? '先搜索并选择一首歌' }}</p>
            </div>
          </div>

          <div class="ot-glass-card mt-5 rounded-lg p-4 shadow-none">
            <p class="text-sm font-medium text-ink">这首歌的分析</p>
            <div v-if="analysis.current" class="mt-3 flex flex-wrap gap-2">
              <span v-for="tag in analysis.current.moodTags.slice(0, 5)" :key="tag" class="ot-tag">{{ tag }}</span>
            </div>
            <p v-else class="mt-3 text-sm leading-6 text-muted">选择歌曲后，可以让 Pi 分析情绪、风格、歌词主题和创作元素。</p>
          </div>

          <div class="ot-glass-card mt-3 rounded-lg p-4 shadow-none">
            <p class="text-sm font-medium text-ink">API 连接</p>
            <p class="mt-2 text-xs leading-5 text-muted">
              没有歌曲时，先运行 `npm run dev:all`，再在这里搜索。
            </p>
          </div>
        </section>

        <section class="ot-glass-card mt-6 p-4">
          <p class="text-sm font-medium text-ink">快捷入口</p>
          <div class="mt-4 grid grid-cols-3 gap-3 text-center">
            <button class="assistant-action" @click="router.push('/analysis')">
              <span>▥</span>
              <small>分析</small>
            </button>
            <button class="assistant-action" @click="router.push('/inspiration')">
              <span>♢</span>
              <small>灵感</small>
            </button>
            <button class="assistant-action" @click="router.push('/composer')">
              <span>♫</span>
              <small>创作</small>
            </button>
          </div>
        </section>
      </aside>

      <footer class="ot-footer col-span-2 flex items-center justify-between border-t border-line/80 px-10 backdrop-blur">
        <div class="flex min-w-0 items-center gap-4">
          <img
            v-if="music.currentTrack?.coverUrl"
            :src="music.currentTrack.coverUrl"
            class="h-12 w-12 rounded-lg object-cover"
            alt=""
          />
          <div v-else class="ot-soft-surface grid h-12 w-12 place-items-center rounded-lg text-muted">♪</div>
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-ink">{{ music.currentTrack?.title ?? '没有正在播放的歌曲' }}</p>
            <p class="truncate text-xs text-muted">{{ music.currentTrack?.artist ?? '搜索真实歌曲后会出现在这里' }}</p>
          </div>
        </div>
        <div class="flex items-center gap-8 text-lg text-muted">
          <button>‹</button>
          <button class="grid h-11 w-11 place-items-center rounded-full bg-accent text-white">▶</button>
          <button>›</button>
        </div>
        <audio v-if="music.playableUrl" :src="music.playableUrl" controls class="h-9 w-[280px]" />
        <button v-else class="text-xl text-muted">☰</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicStore } from '../../stores/music.store'
import { useAnalysisStore } from '../../stores/analysis.store'
import { useThemeStore } from '../../stores/theme.store'

const router = useRouter()
const music = useMusicStore()
const analysis = useAnalysisStore()
const theme = useThemeStore()

const navItems = [
  { to: '/', label: '首页', icon: '⌂' },
  { to: '/listen', label: '听歌', icon: '▣' },
  { to: '/inspiration', label: '灵感', icon: '♧' },
  { to: '/composer', label: '创作台', icon: '✎' },
  { to: '/projects', label: '项目', icon: '□' },
  { to: '/settings', label: '设置', icon: '⚙' }
]

const assistantStatus = computed(() => {
  if (music.loading) return '搜索中'
  if (music.error) return '音乐服务未连接'
  return '准备完毕'
})

async function submitSearch() {
  await music.search()
  router.push('/listen')
}
</script>
