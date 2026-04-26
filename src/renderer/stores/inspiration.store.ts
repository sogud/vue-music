import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Inspiration, SaveInspirationInput } from '@shared/types'

export const useInspirationStore = defineStore('inspiration', () => {
  const inspirations = ref<Inspiration[]>([])
  const loading = ref(false)

  async function saveInspiration(input: SaveInspirationInput) {
    const inspiration = await window.musedesk.inspiration.save(input)
    inspirations.value.unshift(inspiration)
    return inspiration
  }

  async function fetchInspirations() {
    loading.value = true
    try {
      inspirations.value = await window.musedesk.inspiration.list()
    } finally {
      loading.value = false
    }
  }

  async function removeInspiration(id: string) {
    await window.musedesk.inspiration.remove(id)
    inspirations.value = inspirations.value.filter((i) => i.id !== id)
  }

  return {
    inspirations,
    loading,
    saveInspiration,
    fetchInspirations,
    removeInspiration
  }
})
