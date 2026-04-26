<template>
  <div class="top-search">
    <input
      v-model="query"
      type="text"
      :placeholder="t('search.placeholder')"
      class="search-input"
      @input="onInput"
      @focus="showResults = true"
      @blur="onBlur"
    />
    <ul v-if="showResults && results.length" class="search-results">
      <li
        v-for="track in results"
        :key="track.sourceId"
        class="search-item"
        @mousedown.prevent="selectTrack(track)"
      >
        <img v-if="track.coverUrl" :src="track.coverUrl" class="search-thumb" />
        <div>
          <div class="search-title">{{ track.title }}</div>
          <div class="search-artist">{{ track.artist }}</div>
        </div>
      </li>
    </ul>
    <p v-if="showResults && !results.length && query.trim() && !error" class="search-empty">{{ t('search.empty') }}</p>
    <p v-if="error" class="search-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SearchTrackResult, Track } from '@shared/types'
import { usePlayerStore } from '../../stores/player.store'
import { useI18nText } from '../../i18n'

const playerStore = usePlayerStore()
const { t } = useI18nText()
const query = ref('')
const results = ref<SearchTrackResult[]>([])
const showResults = ref(false)
const error = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const emit = defineEmits<{
  select: [track: Track]
}>()

function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    if (query.value.trim()) {
      try {
        results.value = await window.musedesk.tracks.searchTracks(query.value.trim())
        showResults.value = true
        error.value = ''
      } catch {
        results.value = []
        error.value = t('search.error')
      }
    } else {
      results.value = []
      error.value = ''
    }
  }, 300)
}

function onBlur() {
  // Delay to allow click on result
  setTimeout(() => {
    showResults.value = false
  }, 200)
}

async function selectTrack(track: SearchTrackResult) {
  showResults.value = false
  const resolved = await window.musedesk.tracks.resolveTrack({
    source: 'netease',
    sourceId: track.sourceId
  })
  query.value = ''
  results.value = []
  await playerStore.playTrack(resolved)
  emit('select', resolved)
}
</script>

<style scoped>
.top-search {
  position: relative;
  margin-bottom: 24px;
}
.search-input {
  width: 100%;
  border: 1px solid #ded6c8;
  border-radius: 12px;
  padding: 10px 16px;
  background: #fffdfa;
  font-size: 14px;
  outline: none;
}
.search-input:focus {
  border-color: #c4b89a;
}
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fffdfa;
  border: 1px solid #ded6c8;
  border-radius: 12px;
  margin-top: 4px;
  list-style: none;
  padding: 8px 0;
  z-index: 100;
  max-height: 320px;
  overflow-y: auto;
}
.search-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  cursor: pointer;
}
.search-item:hover {
  background: #f7f1e6;
}
.search-thumb {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
}
.search-title {
  font-weight: 500;
}
.search-artist {
  color: #746d63;
  font-size: 13px;
}
.search-empty,
.search-error {
  margin: 8px 2px 0;
  font-size: 12px;
}
.search-empty {
  color: #746d63;
}
.search-error {
  color: #b4503f;
}
</style>
