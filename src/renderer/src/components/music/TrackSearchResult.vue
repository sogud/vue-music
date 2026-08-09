<template>
  <Button
    variant="ghost"
    :data-active="active || undefined"
    :class="cn('ot-track-row grid h-auto w-full grid-cols-[56px_minmax(0,1fr)_auto] gap-4 p-3 text-left hover:bg-transparent')"
    @click="$emit('select')"
  >
    <img
      v-if="track.coverUrl"
      :src="track.coverUrl"
      class="h-14 w-14 rounded-lg object-cover"
      alt=""
    />
    <div v-else class="ot-soft-surface h-14 w-14 rounded-lg" />
    <div class="min-w-0">
      <p class="truncate text-sm font-medium text-ink">{{ track.title }}</p>
      <p class="mt-1 truncate text-xs text-muted">{{ track.artist }}</p>
      <p v-if="track.album" class="mt-1 truncate text-xs text-muted/80">{{ track.album }}</p>
    </div>
    <span class="self-center text-xs text-muted">{{ durationText }}</span>
  </Button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SearchTrackResult } from '@shared/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const props = defineProps<{ track: SearchTrackResult; active?: boolean }>()
defineEmits<{ select: [] }>()

const durationText = computed(() => {
  const minutes = Math.floor(props.track.duration / 60)
  const seconds = props.track.duration % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})
</script>
