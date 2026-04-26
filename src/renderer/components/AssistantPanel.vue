<template>
  <aside class="assistant">
    <h3>{{ t('assistant.title') }}</h3>
    <p class="status">{{ t('assistant.ready') }}</p>

    <!-- Current track mini card -->
    <section class="panel card" v-if="track">
      <div class="mini-track">
        <img v-if="track.coverUrl" :src="track.coverUrl" class="mini-cover" />
        <div>
          <div class="mini-title">{{ track.title }}</div>
          <div class="mini-artist">{{ track.artist }}</div>
        </div>
      </div>
    </section>

    <AnalysisSummaryCard :analysis="analysis" />

    <RecommendedThemeList :themes="analysis?.recommendedThemes ?? []" />

    <section v-if="!analysis && !track" class="panel card">
      <p class="hint">{{ t('assistant.hint') }}</p>
    </section>
  </aside>
</template>

<script setup lang="ts">
import type { Track, SongAnalysis } from '@shared/types'
import AnalysisSummaryCard from './assistant/AnalysisSummaryCard.vue'
import RecommendedThemeList from './assistant/RecommendedThemeList.vue'
import { usePlayerStore } from '../stores/player.store'
import { useAnalysisStore } from '../stores/analysis.store'
import { computed } from 'vue'
import { useI18nText } from '../i18n'

const playerStore = usePlayerStore()
const analysisStore = useAnalysisStore()
const { t } = useI18nText()

const track = computed(() => playerStore.currentTrack)
const analysis = computed(() => analysisStore.currentAnalysis)
</script>

<style scoped>
.mini-track {
  display: flex;
  gap: 12px;
  align-items: center;
}
.mini-cover {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
}
.mini-title {
  font-weight: 600;
  font-size: 14px;
}
.mini-artist {
  color: #746d63;
  font-size: 12px;
}
.hint {
  color: #a39c8e;
  font-size: 13px;
  text-align: center;
}
</style>
