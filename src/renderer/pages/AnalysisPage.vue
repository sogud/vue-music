<template>
  <div>
    <h1>{{ t('analysis.title') }}</h1>

    <div v-if="analysisStore.loading" class="card" style="padding: 32px; text-align: center">
      <p>{{ t('analysis.loading') }}</p>
    </div>

    <div v-else-if="analysisStore.error" class="card" style="padding: 24px">
      <p class="error">{{ analysisStore.error }}</p>
      <button @click="currentTrack && analysisStore.analyzeTrack(currentTrack.id)">{{ t('analysis.retry') }}</button>
    </div>

    <AnalysisSummaryCard :analysis="analysisStore.currentAnalysis" />

    <RecommendedThemeList
      v-if="analysisStore.currentAnalysis"
      :themes="analysisStore.currentAnalysis.recommendedThemes"
    />

    <!-- Lyrics section -->
    <section v-if="lyricText" class="card lyric-section">
      <h3>{{ t('analysis.lyric') }}</h3>
      <pre>{{ lyricText }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AnalysisSummaryCard from '../components/assistant/AnalysisSummaryCard.vue'
import RecommendedThemeList from '../components/assistant/RecommendedThemeList.vue'
import { useAnalysisStore } from '../stores/analysis.store'
import { usePlayerStore } from '../stores/player.store'
import { useI18nText } from '../i18n'

const analysisStore = useAnalysisStore()
const playerStore = usePlayerStore()
const { t } = useI18nText()
const lyricText = ref('')

const currentTrack = computed(() => playerStore.currentTrack)

async function loadLyric() {
  const track = currentTrack.value
  if (!track) {
    lyricText.value = ''
    return
  }

  try {
    const lyric = await window.musedesk.tracks.getLyric(track.id)
    lyricText.value = lyric ?? track.lyric ?? ''
  } catch {
    lyricText.value = track.lyric ?? ''
  }
}

onMounted(() => {
  if (currentTrack.value) {
    analysisStore.fetchAnalysisByTrack(currentTrack.value.id)
    loadLyric()
  }
})

watch(currentTrack, async (track) => {
  if (!track) {
    lyricText.value = ''
    return
  }

  analysisStore.fetchAnalysisByTrack(track.id)
  await loadLyric()
}, { immediate: true })
</script>

<style scoped>
h1 {
  margin: 0 0 16px 0;
  font-weight: 550;
}
.error {
  color: #c44;
}
.lyric-section {
  margin-top: 18px;
  padding: 18px;
}
.lyric-section pre {
  white-space: pre-wrap;
  color: #5f594f;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.8;
}
button {
  border: 1px solid #ddd4c7;
  background: #f8f4ec;
  border-radius: 10px;
  padding: 8px 16px;
  cursor: pointer;
}
</style>
