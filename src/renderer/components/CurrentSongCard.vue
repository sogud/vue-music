<template>
  <section class="card song-card" v-if="song">
    <img class="cover" :src="song.coverUrl" :alt="song.title" />
    <div class="meta">
      <h2>{{ song.title }}</h2>
      <p class="artist">{{ song.artist }} · {{ song.album }}</p>
      <p class="lyric">{{ song.lyricSnippet }}</p>
      <div class="tags">
        <span v-for="tag in song.tags" :key="tag">{{ tag }}</span>
      </div>
      <div class="actions">
        <button @click="$emit('analyze')">AI 分析歌曲按钮</button>
        <button @click="$emit('save')">灵感保存按钮</button>
        <button @click="$emit('direction')">创作方向生成按钮</button>
      </div>
    </div>
    <div class="play-circle">▶</div>
  </section>
</template>

<script setup lang="ts">
import type { Song } from '@shared/types'

defineProps<{ song: Song | null }>()
defineEmits<{
  analyze: []
  save: []
  direction: []
}>()
</script>
