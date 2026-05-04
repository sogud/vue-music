import { defineStore } from 'pinia'
import type { SongAnalysis } from '@shared/types'
import { analysisApi } from '../api/analysis.api'

export const useAnalysisStore = defineStore('analysis', {
  state: () => ({
    current: null as SongAnalysis | null,
    loading: false,
    error: ''
  }),
  actions: {
    async getByTrack(trackId: string) {
      this.error = ''
      this.current = await analysisApi.getByTrack(trackId)
      return this.current
    },
    async analyze(trackId: string, userNote?: string) {
      this.loading = true
      this.error = ''
      try {
        this.current = await analysisApi.analyzeTrack({ trackId, userNote })
        return this.current
      } catch {
        this.error = 'AI 返回格式不符合要求，请重试。'
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    }
  }
})
