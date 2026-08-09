<template>
  <Card class="p-5">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="ot-label">Result</p>
        <h2 class="mt-2 text-xl font-semibold text-ink">分析</h2>
      </div>
      <Button v-if="analysis" variant="outline" @click="$emit('save')">保存</Button>
    </div>
    <p v-if="analysis" class="mt-4 text-sm leading-7 text-muted">{{ analysis.summary }}</p>
    <p v-else class="mt-4 text-sm text-muted">暂无结果</p>

    <div v-if="analysis" class="mt-5 grid gap-4 md:grid-cols-2">
      <TagBlock title="情绪" :items="analysis.moodTags" />
      <TagBlock title="风格" :items="analysis.genreTags" />
      <TagBlock title="主题" :items="analysis.lyricThemes" />
      <TagBlock title="可借鉴" :items="analysis.inspirationPoints" />
      <TagBlock title="规避" :items="analysis.avoidPoints" />
    </div>

    <div v-if="analysis" class="mt-6">
      <p class="ot-label">Suggestions</p>
      <div class="mt-3 grid gap-3">
        <Card v-for="suggestion in analysis.creationSuggestions" :key="suggestion.id" class="bg-soft/70 p-4 shadow-none">
          <p class="text-sm font-medium text-ink">{{ suggestion.title }}</p>
          <p class="mt-1 text-sm leading-6 text-muted">{{ suggestion.description }}</p>
        </Card>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { SongAnalysis } from '@shared/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import TagBlock from './TagBlock.vue'

defineProps<{ analysis: SongAnalysis | null }>()
defineEmits<{ save: [] }>()
</script>
