<template>
  <Card class="flex items-center justify-between gap-4 p-4">
    <div class="min-w-0">
      <p class="truncate text-sm font-medium text-ink">{{ track?.title ?? '未选择歌曲' }}</p>
      <p class="truncate text-xs text-muted">{{ track?.artist ?? '音乐库' }}</p>
    </div>
    <div v-if="playableUrl" class="min-w-[280px] flex-1">
      <MediaChromePlayer :src="playableUrl" :title="track?.title" :artist="track?.artist" />
    </div>
    <p v-else-if="track" class="text-xs text-muted">不可播放，可分析</p>
  </Card>
</template>

<script setup lang="ts">
import type { Track } from '@shared/types'
import { Card } from '@/components/ui/card'
import MediaChromePlayer from './MediaChromePlayer.vue'

defineProps<{
  track: Track | null
  playableUrl: string | null
}>()
</script>
