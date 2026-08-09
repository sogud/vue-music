<template>
  <Card class="p-5">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="ot-label">{{ inspiration.trackArtist || 'Netease' }}</p>
        <h3 class="mt-2 truncate text-lg font-semibold text-ink">{{ inspiration.title }}</h3>
        <p class="mt-1 truncate text-sm text-muted">{{ inspiration.trackTitle || inspiration.trackId }}</p>
      </div>
      <Button variant="outline" class="text-danger hover:border-danger hover:text-danger" @click="$emit('remove')">删除</Button>
    </div>
    <p v-if="inspiration.note" class="mt-4 text-sm leading-6 text-muted">{{ inspiration.note }}</p>
    <div class="mt-4 flex flex-wrap gap-2">
      <Badge v-for="tag in [...inspiration.moodTags, ...inspiration.genreTags]" :key="tag" variant="secondary">{{ tag }}</Badge>
    </div>
    <Button class="mt-5" @click="$emit('compose')">创作</Button>
  </Card>
</template>

<script setup lang="ts">
import type { Inspiration } from '@shared/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

defineProps<{ inspiration: Inspiration }>()
defineEmits<{ compose: []; remove: [] }>()
</script>
