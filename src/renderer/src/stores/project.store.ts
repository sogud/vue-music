import { defineStore } from 'pinia'
import type { Composition, Project } from '@shared/types'
import { projectApi } from '../api/project.api'

export const useProjectStore = defineStore('project', {
  state: () => ({
    items: [] as Project[],
    current: null as Project | null,
    loading: false,
    error: ''
  }),
  actions: {
    async load() {
      this.loading = true
      this.error = ''
      try {
        this.items = await projectApi.list()
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error)
      } finally {
        this.loading = false
      }
    },
    async open(id: string) {
      this.current = await projectApi.get(id)
      return this.current
    },
    async updateComposition(projectId: string, composition: Composition) {
      this.current = await projectApi.updateComposition(projectId, composition)
      await this.load()
      return this.current
    },
    async remove(id: string) {
      await projectApi.remove(id)
      if (this.current?.id === id) this.current = null
      await this.load()
    }
  }
})
