<template>
  <footer class="mini-player" v-if="playerStore.currentTrack">
    <div class="track-info">
      <strong>{{ playerStore.currentTrack.title }}</strong>
      <p>{{ playerStore.currentTrack.artist }}</p>
    </div>
    <div class="controls">
      <button class="ctrl-btn" @click="playerStore.isPlaying ? playerStore.pause() : playerStore.resume()">
        {{ playerStore.isPlaying ? '❚❚' : '▶' }}
      </button>
    </div>
    <div class="vol">
      <input
        type="range"
        min="0"
        max="100"
        :value="Math.round(playerStore.volume * 100)"
        @input="playerStore.setVolume(Number(($event.target as HTMLInputElement).value) / 100)"
      />
    </div>
  </footer>
</template>

<script setup lang="ts">
import { usePlayerStore } from '../stores/player.store'

const playerStore = usePlayerStore()
</script>
