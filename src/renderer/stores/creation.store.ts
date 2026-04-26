import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CreationProject, CreateFromInspirationInput, CreateFromIdeaInput } from '@shared/types'

export const useCreationStore = defineStore('creation', () => {
  const projects = ref<CreationProject[]>([])
  const currentProject = ref<CreationProject | null>(null)
  const loading = ref(false)

  async function createFromInspiration(input: CreateFromInspirationInput) {
    loading.value = true
    try {
      const project = await window.musedesk.creation.createFromInspiration(input)
      projects.value.unshift(project)
      currentProject.value = project
      return project
    } finally {
      loading.value = false
    }
  }

  async function createFromIdea(input: CreateFromIdeaInput) {
    loading.value = true
    try {
      const project = await window.musedesk.creation.createFromIdea(input)
      projects.value.unshift(project)
      currentProject.value = project
      return project
    } finally {
      loading.value = false
    }
  }

  async function fetchProjects() {
    loading.value = true
    try {
      projects.value = await window.musedesk.creation.list()
    } finally {
      loading.value = false
    }
  }

  async function fetchProject(id: string) {
    const project = await window.musedesk.creation.get(id)
    currentProject.value = project
    return project
  }

  return {
    projects,
    currentProject,
    loading,
    createFromInspiration,
    createFromIdea,
    fetchProjects,
    fetchProject
  }
})
