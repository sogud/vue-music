<template>
  <div>
    <header class="hero">
      <p>{{ t('home.caption') }}</p>
      <h1>{{ t('home.greeting') }}</h1>
    </header>

    <CurrentSongCard
      :track="playerStore.currentTrack"
      :playing="playerStore.isPlaying"
      @play="onPlay"
      @pause="playerStore.pause"
      @analyze="onAnalyze"
      @save-inspiration="onSaveInspiration"
    />
    <section v-if="!playerStore.currentTrack" class="card empty-state">
      <h3>{{ t('home.emptyTitle') }}</h3>
      <p>{{ t('home.emptyDesc') }}</p>
    </section>

    <section class="card quick-actions">
      <h3>{{ t('home.start') }}</h3>
      <div class="action-row">
        <input v-model="inspirationNote" :placeholder="t('home.notePlaceholder')" />
        <button @click="onSaveInspiration">{{ t('home.saveInspiration') }}</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CurrentSongCard from '../components/CurrentSongCard.vue'
import { usePlayerStore } from '../stores/player.store'
import { useAnalysisStore } from '../stores/analysis.store'
import { useInspirationStore } from '../stores/inspiration.store'
import type { Track } from '@shared/types'
import { useI18nText } from '../i18n'

const playerStore = usePlayerStore()
const analysisStore = useAnalysisStore()
const inspirationStore = useInspirationStore()
const { t } = useI18nText()
const inspirationNote = ref('')

onMounted(async () => {
  await inspirationStore.fetchInspirations()
})

function onPlay(track: Track) {
  playerStore.playTrack(track)
}

async function onAnalyze() {
  if (!playerStore.currentTrack) return
  await analysisStore.analyzeTrack(playerStore.currentTrack.id)
}

async function onSaveInspiration() {
  if (!playerStore.currentTrack) return
  await inspirationStore.saveInspiration({
    trackId: playerStore.currentTrack.id,
    note: inspirationNote.value.trim() || undefined
  })
  inspirationNote.value = ''
}
</script>

<style scoped>
.hero p {
  color: #80796e;
}
.hero h1 {
  margin-top: 8px;
  margin-bottom: 22px;
  font-weight: 550;
}
.quick-actions {
  margin-top: 18px;
  padding: 18px;
}
.empty-state {
  margin-top: 12px;
  padding: 20px;
  color: #746d63;
}
.empty-state h3 {
  margin: 0 0 6px;
  color: #4a443b;
}
.empty-state p {
  margin: 0;
}
.quick-actions h3 {
  margin: 0 0 12px 0;
}
.action-row {
  display: flex;
  gap: 10px;
}
.action-row input {
  flex: 1;
  border: 1px solid #ded6c8;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fffdfa;
}
.action-row button,
.quick-actions button {
  border: 1px solid #ddd4c7;
  background: #f8f4ec;
  color: #3d382f;
  border-radius: 10px;
  padding: 8px 16px;
  cursor: pointer;
  white-space: nowrap;
}
</style>
