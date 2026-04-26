<template>
  <div class="track-search-result" @click="playerStore.playTrack(track)">
    <img v-if="track.coverUrl" :src="track.coverUrl" class="thumb" />
    <div class="info">
      <div class="track-title">{{ track.title }}</div>
      <div class="track-artist">{{ track.artist }} · {{ formatDuration(track.duration) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Track } from '@shared/types'
import { usePlayerStore } from '../../stores/player.store'

const playerStore = usePlayerStore()

defineProps<{
  track: Track
}>()

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.track-search-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  cursor: pointer;
}
.track-search-result:hover {
  background: #f7f1e6;
}
.thumb {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
}
.track-title {
  font-weight: 500;
}
.track-artist {
  color: #746d63;
  font-size: 13px;
}
</style>
