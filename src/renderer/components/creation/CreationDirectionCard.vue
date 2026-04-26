<template>
  <div class="card direction-card">
    <h3>{{ direction.title }}</h3>
    <p class="desc">{{ direction.description }}</p>

    <div class="chips">
      <span v-for="tag in direction.moodTags" :key="tag">{{ tag }}</span>
      <span v-for="tag in direction.genreTags" :key="tag" class="genre">{{ tag }}</span>
    </div>

    <div class="field">
      <label>{{ t('creation.musicPrompt') }}</label>
      <div class="prompt-box">
        <code>{{ direction.musicPrompt }}</code>
        <button class="copy-btn" @click="copy(direction.musicPrompt)">{{ t('common.copy') }}</button>
      </div>
    </div>

    <div class="field">
      <label>{{ t('creation.lyricTheme') }}</label>
      <p>{{ direction.lyricTheme }}</p>
    </div>

    <div class="field">
      <label>{{ t('creation.coverPrompt') }}</label>
      <div class="prompt-box">
        <code>{{ direction.coverPrompt }}</code>
        <button class="copy-btn" @click="copy(direction.coverPrompt)">{{ t('common.copy') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CreationDirection } from '@shared/types'
import { useI18nText } from '../../i18n'

const { t } = useI18nText()

defineProps<{
  direction: CreationDirection
}>()

async function copy(text: string) {
  await navigator.clipboard.writeText(text)
}
</script>

<style scoped>
.direction-card {
  padding: 20px;
}
.direction-card h3 {
  margin: 0 0 4px 0;
}
.desc {
  color: #6d665d;
  margin: 4px 0 12px;
}
.field {
  margin-top: 14px;
}
.field label {
  font-weight: 600;
  font-size: 13px;
  display: block;
  margin-bottom: 4px;
}
.prompt-box {
  background: #f7f1e6;
  border-radius: 10px;
  padding: 10px 14px;
  position: relative;
}
.prompt-box code {
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  color: #4a4439;
}
.copy-btn {
  position: absolute;
  top: 6px;
  right: 10px;
  border: 1px solid #ddd4c7;
  background: #f8f4ec;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 11px;
  cursor: pointer;
}
.genre {
  background: #e8e1d2;
  color: #3d382f;
}
</style>
