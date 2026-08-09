<template>
  <section class="ot-page flex flex-col">
    <div class="ot-page-header">
      <div>
        <p class="ot-label">Home</p>
        <h1 class="ot-page-title">今天听什么？</h1>
        <p class="mt-3 text-sm text-muted">听歌、分析、生成原创工程。</p>
      </div>
      <Button class="h-11 rounded-full px-6" @click="router.push('/listen')">去听歌</Button>
    </div>

    <Card
      v-motion
      :initial="motion.softScale.value.initial"
      :enter="motion.softScale.value.enter"
      class="ot-hero-card p-6"
    >
      <div class="relative z-10 flex items-center gap-8">
        <img
          v-if="music.currentTrack?.coverUrl"
          :src="music.currentTrack.coverUrl"
          class="h-44 w-44 rounded-2xl object-cover shadow-[0_24px_64px_rgb(0_0_0/0.38)]"
          alt=""
        />
        <div v-else class="ot-soft-surface grid h-44 w-44 place-items-center rounded-2xl text-5xl text-muted shadow-[0_24px_64px_rgb(0_0_0/0.28)]">♪</div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-4xl font-semibold leading-tight text-ink">{{ music.currentTrack?.title ?? '还没有歌曲' }}</p>
          <p class="mt-3 text-base text-muted">{{ music.currentTrack?.artist ?? '从真实音乐开始' }}</p>
          <div class="mt-5 flex flex-wrap gap-2">
            <Badge variant="secondary">Netease</Badge>
            <Badge variant="secondary">AI</Badge>
            <Badge variant="secondary">MIDI</Badge>
            <Badge variant="secondary">WAV</Badge>
          </div>
        </div>
        <Button size="icon" class="ot-play-button h-[76px] w-[76px] shrink-0 rounded-full" @click="goPrimary">
          <Play class="h-7 w-7 fill-current" :stroke-width="1.8" />
        </Button>
      </div>
    </Card>

    <section class="mt-7">
      <p class="ot-label">Start</p>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <Card class="ot-action-tile min-h-32 cursor-pointer p-5 transition hover:-translate-y-0.5" @click="router.push('/listen')">
          <Sparkles class="h-5 w-5 text-accent" :stroke-width="1.7" />
          <span class="mt-4 block text-base font-medium text-ink">听歌与分析</span>
          <span class="mt-2 block text-sm leading-6 text-muted">搜索、播放、提炼创作方向。</span>
          <ArrowRight class="mt-4 h-5 w-5 text-accent" :stroke-width="1.7" />
        </Card>

        <Card class="ot-action-tile min-h-32 cursor-pointer p-5 transition hover:-translate-y-0.5" @click="router.push('/composer')">
          <PencilLine class="h-5 w-5 text-accent" :stroke-width="1.7" />
          <span class="mt-4 block text-base font-medium text-ink">创作工程</span>
          <span class="mt-2 block text-sm leading-6 text-muted">生成、编辑、渲染。</span>
          <ArrowRight class="mt-4 h-5 w-5 text-accent" :stroke-width="1.7" />
        </Card>
      </div>
    </section>

    <Card v-if="isEmpty" class="ot-action-tile mt-6 flex items-center justify-between gap-5 p-4">
      <div>
        <p class="text-sm font-medium text-ink">无数据</p>
        <p class="mt-1.5 text-sm leading-6 text-muted">连接音乐服务后开始。</p>
      </div>
      <code class="ot-terminal rounded-lg px-4 py-3 text-xs">npm run dev:all</code>
      <Button variant="outline" @click="router.push('/settings')">设置</Button>
    </Card>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useMotionPresets } from '@/lib/motion'
import { ArrowRight, PencilLine, Play, Sparkles } from 'lucide-vue-next'
import { useMusicStore } from '../stores/music.store'
import { useProjectStore } from '../stores/project.store'
import { useInspirationStore } from '../stores/inspiration.store'

const router = useRouter()
const motion = useMotionPresets()
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
