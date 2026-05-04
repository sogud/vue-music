import { defineStore } from 'pinia'
import type { Inspiration } from '@shared/types'
import { inspirationApi } from '../api/inspiration.api'

export const useInspirationStore = defineStore('inspiration', {
  state: () => ({
    items: [] as Inspiration[],
    loading: false,
    error: ''
  }),
  actions: {
    async load() {
      this.loading = true
      this.error = ''
      try {
        this.items = await inspirationApi.list()
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error)
      } finally {
        this.loading = false
      }
    },
    async save(input: { trackId: string; analysisId?: string; note?: string }) {
      const inspiration = await inspirationApi.save(input)
      await this.load()
      return inspiration
    },
    async remove(id: string) {
      await inspirationApi.remove(id)
      this.items = this.items.filter((item) => item.id !== id)
    }
  }
})
