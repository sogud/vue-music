<template>
  <aside class="assistant">
    <h3>AI 助手摘要面板</h3>
    <p class="status">● 准备完了</p>

    <section class="panel card" v-if="analysis">
      <h4>这首歌的分析</h4>
      <p class="summary">{{ analysis.summary }}</p>
      <div class="chips">
        <span v-for="item in analysis.keywords" :key="item">{{ item }}</span>
      </div>
    </section>

    <section class="panel card">
      <h4>推荐创作主题</h4>
      <ul>
        <li v-for="theme in themes" :key="theme">{{ theme }}</li>
      </ul>
    </section>

    <section class="panel card" v-if="directions.length">
      <h4>最新创作方向</h4>
      <p class="direction-title">{{ directions[0].title }}</p>
      <p>{{ directions[0].concept }}</p>
    </section>

    <section class="panel card" v-if="inspirations.length">
      <h4>最近灵感</h4>
      <ul>
        <li v-for="idea in inspirations.slice(0, 3)" :key="idea.id">{{ idea.note }}</li>
      </ul>
    </section>
  </aside>
</template>

<script setup lang="ts">
import type { CreationDirection, Inspiration, SongAnalysis } from '@shared/types'

defineProps<{
  analysis: SongAnalysis | null
  themes: string[]
  directions: CreationDirection[]
  inspirations: Inspiration[]
}>()
</script>
