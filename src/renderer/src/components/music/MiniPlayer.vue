<template>
  <div class="ot-card flex items-center justify-between gap-4 p-4">
    <div class="min-w-0">
      <p class="truncate text-sm font-medium text-ink">{{ track?.title ?? '未选择歌曲' }}</p>
      <p class="truncate text-xs text-muted">{{ track?.artist ?? '搜索后选择一首歌开始' }}</p>
    </div>
    <audio v-if="playableUrl" :src="playableUrl" controls class="h-9 w-[320px]" />
    <p v-else-if="track" class="text-xs text-muted">当前歌曲暂时无法播放，但仍可用于 AI 分析。</p>
  </div>
</template>

<script setup lang="ts">
import type { Track } from '@shared/types'

defineProps<{
  track: Track | null
  playableUrl: string | null
}>()
</script>
