<template>
  <section class="ot-page">
    <header class="ot-page-header">
      <div>
        <p class="ot-label">Analysis</p>
        <h1 class="ot-page-title">歌曲分析</h1>
        <p v-if="music.currentTrack" class="mt-2 text-sm text-muted">
          {{ music.currentTrack.title }} · {{ music.currentTrack.artist }}
        </p>
      </div>
      <Button variant="outline" @click="router.push('/listen')">选择歌曲</Button>
    </header>

    <Card v-if="!music.currentTrack" class="p-7 text-sm text-muted">
      未选择歌曲
    </Card>

    <div v-else class="grid gap-5">
      <Card class="p-5">
        <label class="ot-label" for="user-note">用户备注</label>
        <Textarea id="user-note" v-model="userNote" class="mt-2 min-h-24" placeholder="关注点，可选" />
        <div class="mt-4 flex gap-3">
          <Button :disabled="analysis.loading" @click="runAnalysis">
            {{ analysis.loading ? '分析中' : '分析' }}
          </Button>
          <Button variant="outline" :disabled="!analysis.current" @click="goComposer">创作</Button>
        </div>
        <p v-if="analysis.error" class="mt-3 text-sm text-danger">{{ analysis.error }}</p>
      </Card>

      <AnalysisSummaryCard :analysis="analysis.current" @save="saveInspiration" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import AnalysisSummaryCard from '../components/analysis/AnalysisSummaryCard.vue'
import { useAnalysisStore } from '../stores/analysis.store'
import { useMusicStore } from '../stores/music.store'
import { useInspirationStore } from '../stores/inspiration.store'

const router = useRouter()
const music = useMusicStore()
const analysis = useAnalysisStore()
const inspirations = useInspirationStore()
const userNote = ref('')

onMounted(async () => {
  if (music.currentTrack) await analysis.getByTrack(music.currentTrack.id)
})

async function runAnalysis() {
  if (!music.currentTrack) return
  await analysis.analyze(music.currentTrack.id, userNote.value || undefined)
}

async function saveInspiration() {
  if (!music.currentTrack) return
  await inspirations.save({ trackId: music.currentTrack.id, analysisId: analysis.current?.id })
  router.push('/inspiration')
}

function goComposer() {
  router.push({ path: '/composer', query: { sourceAnalysisId: analysis.current?.id } })
}
</script>
