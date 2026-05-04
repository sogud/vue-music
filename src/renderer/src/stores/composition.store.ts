import { defineStore } from 'pinia'
import type { Project } from '@shared/types'
import { compositionApi } from '../api/composition.api'

export const useCompositionStore = defineStore('composition', {
  state: () => ({
    generatedProject: null as Project | null,
    validationErrors: [] as string[],
    loading: false,
    error: ''
  }),
  actions: {
    async generateFromIdea(input: {
      idea: string
      bars: number
      bpm?: number
      style?: string
      sourceAnalysisId?: string
      sourceInspirationId?: string
    }) {
      this.loading = true
      this.error = ''
      try {
        this.generatedProject = await compositionApi.generateFromIdea(input)
        return this.generatedProject
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async validate(composition: unknown) {
      const result = await compositionApi.validate(composition)
      this.validationErrors = result.errors
      return result
    }
  }
})
