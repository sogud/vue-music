<template>
  <section class="card song-card" v-if="track">
    <div class="cover-wrap" @click="$emit('play', track)">
      <img class="cover" :src="track.coverUrl" :alt="track.title" />
      <div class="play-circle">▶</div>
    </div>
    <div class="meta">
      <h2>{{ track.title }}</h2>
      <p class="artist">{{ track.artist }}<span v-if="track.album"> · {{ track.album }}</span></p>
      <p class="duration">{{ formatDuration(track.duration) }}</p>
      <div class="tags">
        <span v-for="tag in track.tags" :key="tag">{{ tag }}</span>
      </div>
      <div class="actions">
        <button @click="$emit('analyze')">{{ t('song.analyze') }}</button>
        <button @click="$emit('save-inspiration')">{{ t('song.save') }}</button>
        <button @click="$emit('generate-direction')">{{ t('song.generate') }}</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Track } from '@shared/types'
import { useI18nText } from '../i18n'

const { t } = useI18nText()

defineProps<{
  track: Track | null
  playing: boolean
}>()

defineEmits<{
  play: [track: Track]
  pause: []
  analyze: []
  'save-inspiration': []
  'generate-direction': []
}>()

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.song-card {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 24px;
  padding: 24px;
}
.cover-wrap {
  position: relative;
  cursor: pointer;
}
.cover {
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: 16px;
}
.play-circle {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 18px;
}
.artist,
.duration {
  color: #6d665d;
}
.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.tags span {
  background: #f2ede3;
  color: #5f594f;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
}
.actions {
  margin-top: 14px;
  display: flex;
  gap: 12px;
}
.actions button {
  border: 1px solid #ddd4c7;
  background: #f8f4ec;
  color: #3d382f;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 13px;
}
</style>
