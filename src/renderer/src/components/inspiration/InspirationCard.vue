<template>
  <article class="ot-card p-5">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="ot-label">{{ inspiration.trackArtist || 'Netease' }}</p>
        <h3 class="mt-2 truncate text-lg font-semibold text-ink">{{ inspiration.title }}</h3>
        <p class="mt-1 truncate text-sm text-muted">{{ inspiration.trackTitle || inspiration.trackId }}</p>
      </div>
      <button class="ot-button text-danger hover:border-danger hover:text-danger" @click="$emit('remove')">删除</button>
    </div>
    <p v-if="inspiration.note" class="mt-4 text-sm leading-6 text-muted">{{ inspiration.note }}</p>
    <div class="mt-4 flex flex-wrap gap-2">
      <span v-for="tag in [...inspiration.moodTags, ...inspiration.genreTags]" :key="tag" class="ot-tag">{{ tag }}</span>
    </div>
    <button class="ot-button-primary mt-5" @click="$emit('compose')">基于灵感创作</button>
  </article>
</template>

<script setup lang="ts">
import type { Inspiration } from '@shared/types'

defineProps<{ inspiration: Inspiration }>()
defineEmits<{ compose: []; remove: [] }>()
</script>
