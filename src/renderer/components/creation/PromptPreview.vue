<template>
  <div class="prompt-preview card" v-if="text">
    <div class="prompt-header">
      <span class="label">{{ label }}</span>
      <button class="copy-btn" @click="copy(text)">{{ t('common.copy') }}</button>
    </div>
    <pre><code>{{ text }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { useI18nText } from '../../i18n'

const { t } = useI18nText()

defineProps<{
  label: string
  text: string
}>()

async function copy(text: string) {
  await navigator.clipboard.writeText(text)
}
</script>

<style scoped>
.prompt-preview {
  padding: 16px;
}
.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.label {
  font-weight: 600;
  font-size: 14px;
}
.copy-btn {
  border: 1px solid #ddd4c7;
  background: #f8f4ec;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
}
pre {
  background: #f7f1e6;
  border-radius: 10px;
  padding: 12px;
  overflow-x: auto;
  margin: 0;
}
code {
  font-size: 13px;
  color: #4a4439;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
