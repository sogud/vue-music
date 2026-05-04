import { defineStore } from 'pinia'
import type { RenderOutput, RenderToolStatus } from '@shared/types'
import { renderApi } from '../api/render.api'

export const useRenderStore = defineStore('render', {
  state: () => ({
    status: null as RenderToolStatus | null,
    output: null as RenderOutput | null,
    loading: false,
    error: ''
  }),
  actions: {
    async checkTools() {
      this.status = await renderApi.checkTools()
      return this.status
    },
    async renderProject(projectId: string) {
      this.loading = true
      this.error = ''
      try {
        this.output = await renderApi.renderProject(projectId)
        return this.output
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error)
        throw error
      } finally {
        this.loading = false
      }
    },
    openOutputFolder(projectId: string) {
      return renderApi.openOutputFolder(projectId)
    }
  }
})
