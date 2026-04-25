<template>
  <footer class="mini-player" v-if="song">
    <div>
      <strong>{{ song.title }}</strong>
      <p>{{ song.artist }}</p>
    </div>
    <div class="controls">◀︎　▶︎　▸▸</div>
  </footer>
</template>

<script setup lang="ts">
import type { Song } from '@shared/types'

defineProps<{ song: Song | null }>()
</script>
