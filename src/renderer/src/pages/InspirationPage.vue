<template>
  <section class="mx-auto max-w-6xl px-8 py-10">
    <header class="flex items-start justify-between gap-4">
      <div>
        <p class="ot-label">Inspiration</p>
        <h1 class="mt-2 text-3xl font-semibold text-ink">灵感库</h1>
      </div>
      <button class="ot-button" @click="inspirations.load">刷新</button>
    </header>

    <div v-if="inspirations.items.length === 0" class="ot-card mt-8 p-7 text-sm text-muted">
      暂无灵感。可以从歌曲分析结果保存，也可以直接进入创作台。
    </div>

    <div v-else class="mt-8 grid gap-4 md:grid-cols-2">
      <InspirationCard
        v-for="item in inspirations.items"
        :key="item.id"
        :inspiration="item"
        @remove="inspirations.remove(item.id)"
        @compose="composeFrom(item)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Inspiration } from '@shared/types'
import InspirationCard from '../components/inspiration/InspirationCard.vue'
import { useInspirationStore } from '../stores/inspiration.store'

const router = useRouter()
const inspirations = useInspirationStore()

onMounted(() => inspirations.load())

function composeFrom(inspiration: Inspiration) {
  router.push({
    path: '/composer',
    query: {
      sourceInspirationId: inspiration.id,
      sourceAnalysisId: inspiration.analysisId
    }
  })
}
</script>
