<template>
  <media-controller class="ot-media-player" audio>
    <audio
      ref="audioEl"
      slot="media"
      :src="src"
      preload="metadata"
      @ended="$emit('ended')"
    />
    <media-control-bar>
      <media-play-button aria-label="Play or pause"></media-play-button>
      <media-time-display showduration></media-time-display>
      <media-time-range></media-time-range>
      <media-mute-button aria-label="Mute"></media-mute-button>
      <media-volume-range></media-volume-range>
    </media-control-bar>
  </media-controller>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = defineProps<{
  src: string
  title?: string
  artist?: string
  autoplayToken?: number
}>()

defineEmits<{ ended: [] }>()

const audioEl = ref<HTMLAudioElement | null>(null)

watch(
  () => [props.src, props.autoplayToken] as const,
  async () => {
    await nextTick()
    const audio = audioEl.value
    if (!audio || !props.autoplayToken) return
    try {
      audio.load()
      await audio.play()
    } catch {
      // Browser autoplay policies can still block if the src was not user initiated.
    }
  },
  { flush: 'post' }
)
</script>
