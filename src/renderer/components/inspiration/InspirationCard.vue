<template>
  <div class="card inspiration-card">
    <h3>{{ inspiration.title }}</h3>
    <p v-if="inspiration.note" class="note">{{ inspiration.note }}</p>
    <div class="chips">
      <span v-for="tag in inspiration.moodTags" :key="tag">{{ tag }}</span>
      <span v-for="tag in inspiration.genreTags" :key="tag" class="genre">{{ tag }}</span>
    </div>
    <div class="meta">{{ formatDate(inspiration.createdAt) }}</div>
    <div class="actions">
      <button @click="$emit('create-project', inspiration.id)">{{ t('inspiration.createProject') }}</button>
      <button @click="$emit('generate-composition', inspiration.id)">{{ t('inspiration.generateComposition') }}</button>
      <button @click="$emit('delete', inspiration.id)">{{ t('common.delete') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Inspiration } from '@shared/types'
import { useI18nText } from '../../i18n'

const { t, locale } = useI18nText()

defineProps<{
  inspiration: Inspiration
}>()

defineEmits<{
  'create-project': [id: string]
  'generate-composition': [id: string]
  'delete': [id: string]
}>()

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(locale.value)
}
</script>

<style scoped>
.inspiration-card {
  padding: 18px;
}
.inspiration-card h3 {
  margin: 0 0 6px 0;
}
.note {
  color: #6d665d;
  margin: 4px 0;
}
.meta {
  color: #a39c8e;
  font-size: 12px;
  margin-top: 8px;
}
.genre {
  background: #e8e1d2;
  color: #3d382f;
}
</style>
