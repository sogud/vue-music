<template>
  <section class="panel card" v-if="themes.length">
    <h4>{{ t('analysis.recommendedThemes') }}</h4>
    <div v-for="theme in themes" :key="theme.id" class="theme-item">
      <div class="theme-title">{{ theme.title }}</div>
      <div class="theme-desc">{{ theme.description }}</div>
      <div class="chips">
        <span v-for="tag in theme.moodTags" :key="tag">{{ tag }}</span>
        <span v-for="tag in theme.genreTags" :key="tag" class="genre">{{ tag }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CreationTheme } from '@shared/types'
import { useI18nText } from '../../i18n'

const { t } = useI18nText()

defineProps<{
  themes: CreationTheme[]
}>()
</script>

<style scoped>
.theme-item {
  padding: 10px 0;
  border-bottom: 1px solid #ebe5db;
}
.theme-item:last-child {
  border-bottom: none;
}
.theme-title {
  font-weight: 600;
}
.theme-desc {
  color: #746d63;
  font-size: 13px;
  margin: 4px 0;
}
.genre {
  background: #e8e1d2;
  color: #3d382f;
}
</style>
