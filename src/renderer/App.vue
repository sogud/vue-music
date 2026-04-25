<template>
  <div class="layout" v-if="store.song">
    <aside class="sidebar card soft">
      <div class="brand">muse.</div>
      <nav>
        <button class="nav-item active">首页</button>
        <button class="nav-item">灵感库</button>
        <button class="nav-item">创作方向</button>
      </nav>
    </aside>

    <main class="content">
      <header class="hero">
        <p>いまの気分に寄り添う音楽</p>
        <h1>听歌，记录灵感，开始创作</h1>
      </header>

      <CurrentSongCard
        :song="store.song"
        @analyze="handleAnalyze"
        @save="handleSaveInspiration"
        @direction="handleGenerateDirection"
      />

      <section class="card quick-actions">
        <h3>从这里开始</h3>
        <div class="action-row">
          <input v-model="inspirationText" placeholder="写下此刻灵感…" />
          <button @click="handleSaveInspiration">灵感保存按钮</button>
        </div>
      </section>
    </main>

    <AssistantPanel
      :analysis="store.analysis"
      :themes="computedThemes"
      :directions="store.directions"
      :inspirations="store.inspirations"
    />

    <MiniPlayer :song="store.song" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import CurrentSongCard from './components/CurrentSongCard.vue'
import AssistantPanel from './components/AssistantPanel.vue'
import MiniPlayer from './components/MiniPlayer.vue'
import { useMusicStore } from './stores/music'

const store = useMusicStore()
const inspirationText = ref('副歌应该在第 2 遍时加入一条轻和声。')

const computedThemes = computed(() => {
  if (store.themes.length > 0) return store.themes
  return ['点击“AI 分析歌曲按钮”后生成主题建议']
})

onMounted(async () => {
  await store.hydrateHome()
})

async function handleAnalyze() {
  await store.analyzeCurrentSong()
}

async function handleSaveInspiration() {
  const note = inspirationText.value.trim()
  if (!note) return
  await store.saveInspiration(note)
}

async function handleGenerateDirection() {
  await store.generateDirection()
}
</script>
