import { defineStore } from 'pinia'
import type { CreationDirection, Inspiration, Song, SongAnalysis } from '@shared/types'

interface MusicState {
  loading: boolean
  song: Song | null
  analysis: SongAnalysis | null
  themes: string[]
  directions: CreationDirection[]
  inspirations: Inspiration[]
}

export const useMusicStore = defineStore('music', {
  state: (): MusicState => ({
    loading: false,
    song: null,
    analysis: null,
    themes: [],
    directions: [],
    inspirations: []
  }),
  actions: {
    async hydrateHome() {
      this.loading = true
      try {
        const snapshot = await window.musedesk.getHomeSnapshot()
        this.song = snapshot.song
        this.analysis = snapshot.latestAnalysis
        this.directions = snapshot.directions
        this.inspirations = snapshot.inspirations
      } finally {
        this.loading = false
      }
    },
    async analyzeCurrentSong() {
      const result = await window.musedesk.analyzeCurrentSong()
      this.analysis = result.analysis
      this.themes = result.recommendedThemes
    },
    async saveInspiration(note: string) {
      const inspiration = await window.musedesk.saveInspiration(note)
      this.inspirations.unshift(inspiration)
    },
    async generateDirection() {
      const direction = await window.musedesk.generateDirection()
      this.directions.unshift(direction)
    }
  }
})
