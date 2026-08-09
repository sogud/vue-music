<template>
  <section class="ot-page">
    <header class="ot-page-header">
      <div>
        <p class="ot-label">Inspiration</p>
        <h1 class="ot-page-title">灵感</h1>
      </div>
      <Button variant="outline" @click="inspirations.load">刷新</Button>
    </header>

    <Card v-if="inspirations.items.length === 0" class="p-7 text-sm text-muted">
      暂无灵感
    </Card>

    <div v-else class="grid gap-4 md:grid-cols-2">
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
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
