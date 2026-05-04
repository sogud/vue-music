<template>
  <section class="ot-card p-5">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="ot-label">Song analysis</p>
        <h2 class="mt-2 text-xl font-semibold text-ink">歌曲分析</h2>
      </div>
      <button v-if="analysis" class="ot-button" @click="$emit('save')">保存灵感</button>
    </div>
    <p v-if="analysis" class="mt-4 text-sm leading-7 text-muted">{{ analysis.summary }}</p>
    <p v-else class="mt-4 text-sm text-muted">还没有分析结果。</p>

    <div v-if="analysis" class="mt-5 grid gap-4 md:grid-cols-2">
      <TagBlock title="情绪标签" :items="analysis.moodTags" />
      <TagBlock title="风格标签" :items="analysis.genreTags" />
      <TagBlock title="歌词主题" :items="analysis.lyricThemes" />
      <TagBlock title="可借鉴元素" :items="analysis.inspirationPoints" />
      <TagBlock title="规避元素" :items="analysis.avoidPoints" />
    </div>

    <div v-if="analysis" class="mt-6">
      <p class="ot-label">Creation suggestions</p>
      <div class="mt-3 grid gap-3">
        <article v-for="suggestion in analysis.creationSuggestions" :key="suggestion.id" class="ot-soft-surface rounded-lg p-4">
          <p class="text-sm font-medium text-ink">{{ suggestion.title }}</p>
          <p class="mt-1 text-sm leading-6 text-muted">{{ suggestion.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SongAnalysis } from '@shared/types'
import TagBlock from './TagBlock.vue'

defineProps<{ analysis: SongAnalysis | null }>()
defineEmits<{ save: [] }>()
</script>
