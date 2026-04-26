<template>
  <section class="panel card" v-if="analysis">
    <h4>{{ t('analysis.cardTitle') }}</h4>
    <p class="summary">{{ analysis.summary }}</p>
    <div class="chips">
      <span v-for="tag in analysis.moodTags" :key="tag">{{ tag }}</span>
      <span v-for="tag in analysis.genreTags" :key="tag" class="genre">{{ tag }}</span>
    </div>
    <div v-if="analysis.lyricThemes.length" class="section">
      <h5>{{ t('analysis.lyricThemes') }}</h5>
      <p>{{ analysis.lyricThemes.join('、') }}</p>
    </div>
    <div v-if="analysis.inspirationPoints.length" class="section">
      <h5>{{ t('analysis.inspirationPoints') }}</h5>
      <ul>
        <li v-for="point in analysis.inspirationPoints" :key="point">{{ point }}</li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SongAnalysis } from '@shared/types'
import { useI18nText } from '../../i18n'

const { t } = useI18nText()

defineProps<{
  analysis: SongAnalysis | null
}>()
</script>

<style scoped>
.summary {
  color: #5f594f;
  line-height: 1.6;
}
.genre {
  background: #e8e1d2;
  color: #3d382f;
}
.section {
  margin-top: 12px;
}
.section h5 {
  margin-bottom: 4px;
}
.section ul {
  padding-left: 18px;
  margin: 0;
}
.section li {
  color: #6d665d;
  font-size: 13px;
}
</style>
