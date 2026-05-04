<template>
  <section class="mx-auto max-w-6xl px-8 py-10">
    <header class="flex items-start justify-between gap-4">
      <div>
        <p class="ot-label">Analysis</p>
        <h1 class="mt-2 text-3xl font-semibold text-ink">AI 歌曲分析</h1>
        <p v-if="music.currentTrack" class="mt-2 text-sm text-muted">
          {{ music.currentTrack.title }} · {{ music.currentTrack.artist }}
        </p>
      </div>
      <button class="ot-button" @click="router.push('/listen')">选择歌曲</button>
    </header>

    <div v-if="!music.currentTrack" class="ot-card mt-8 p-7 text-sm text-muted">
      还没有选择歌曲。先到听歌页面搜索并选择一首歌。
    </div>

    <div v-else class="mt-8 grid gap-5">
      <div class="ot-card p-5">
        <label class="ot-label" for="user-note">用户备注</label>
        <textarea id="user-note" v-model="userNote" class="ot-input mt-2 min-h-24 w-full" placeholder="可选：告诉 AI 你想关注的情绪、风格或创作方向" />
        <div class="mt-4 flex gap-3">
          <button class="ot-button-primary" :disabled="analysis.loading" @click="runAnalysis">
            {{ analysis.loading ? '分析中...' : '开始分析' }}
          </button>
          <button class="ot-button" :disabled="!analysis.current" @click="goComposer">基于分析创作</button>
        </div>
        <p v-if="analysis.error" class="mt-3 text-sm text-danger">{{ analysis.error }}</p>
      </div>

      <AnalysisSummaryCard :analysis="analysis.current" @save="saveInspiration" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
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
