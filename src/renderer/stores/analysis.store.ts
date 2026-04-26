import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SongAnalysis } from '@shared/types'

export const useAnalysisStore = defineStore('analysis', () => {
  const currentAnalysis = ref<SongAnalysis | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function analyzeTrack(trackId: string, userNote?: string) {
    loading.value = true
    error.value = null
    try {
      currentAnalysis.value = await window.musedesk.analysis.analyzeTrack({ trackId, userNote })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Analysis failed'
    } finally {
      loading.value = false
    }
  }

  async function fetchAnalysisByTrack(trackId: string) {
    const result = await window.musedesk.analysis.getByTrack(trackId)
    currentAnalysis.value = result
  }

  return {
    currentAnalysis,
    loading,
    error,
    analyzeTrack,
    fetchAnalysisByTrack
  }
})
