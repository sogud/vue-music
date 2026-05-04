import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type {
  CompositionProject,
  GenerateCompositionFromIdeaInput,
  GenerateCompositionFromInspirationInput,
  GenerateCompositionFromTrackInput,
  RenderCompositionInput,
  UpdateCompositionInput
} from '@shared/types'

export const useCompositionStore = defineStore('composition', () => {
  const projects = ref<CompositionProject[]>([])
  const currentProject = ref<CompositionProject | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const rendering = ref(false)
  const error = ref('')
  const lastSuccess = ref('')

  const hasProjects = computed(() => projects.value.length > 0)

  function upsertProject(project: CompositionProject) {
    const index = projects.value.findIndex((item) => item.id === project.id)
    if (index === -1) {
      projects.value.unshift(project)
    } else {
      projects.value[index] = project
    }
    if (!currentProject.value || currentProject.value.id === project.id) {
      currentProject.value = project
    }
  }

  async function fetchProjects() {
    loading.value = true
    error.value = ''
    try {
      projects.value = await window.musedesk.composition.list()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Fetch projects failed'
      projects.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchProject(id: string) {
    loading.value = true
    error.value = ''
    try {
      const project = await window.musedesk.composition.get(id)
      currentProject.value = project
      return project
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Fetch project failed'
      currentProject.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  async function generateFromTrack(input: GenerateCompositionFromTrackInput) {
    loading.value = true
    error.value = ''
    lastSuccess.value = ''
    try {
      const project = await window.musedesk.composition.generateFromTrack(input)
      upsertProject(project)
      return project
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Generate from track failed'
      return null
    } finally {
      loading.value = false
    }
  }

  async function generateFromInspiration(input: GenerateCompositionFromInspirationInput) {
    loading.value = true
    error.value = ''
    lastSuccess.value = ''
    try {
      const project = await window.musedesk.composition.generateFromInspiration(input)
      upsertProject(project)
      return project
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Generate from inspiration failed'
      return null
    } finally {
      loading.value = false
    }
  }

  async function generateFromIdea(input: GenerateCompositionFromIdeaInput) {
    loading.value = true
    error.value = ''
    lastSuccess.value = ''
    try {
      const project = await window.musedesk.composition.generateFromIdea(input)
      upsertProject(project)
      return project
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Generate from idea failed'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateComposition(input: UpdateCompositionInput) {
    saving.value = true
    error.value = ''
    lastSuccess.value = ''
    try {
      const project = await window.musedesk.composition.updateComposition(input)
      upsertProject(project)
      return project
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Save composition failed'
      throw e
    } finally {
      saving.value = false
    }
  }

  async function renderProject(input: RenderCompositionInput) {
    rendering.value = true
    error.value = ''
    lastSuccess.value = ''
    try {
      const project = await window.musedesk.composition.renderComposition(input)
      upsertProject(project)
      return project
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Render project failed'
      throw e
    } finally {
      rendering.value = false
    }
  }

  function clearError() {
    error.value = ''
  }

  function clearSuccess() {
    lastSuccess.value = ''
  }

  return {
    projects,
    currentProject,
    loading,
    saving,
    rendering,
    error,
    lastSuccess,
    hasProjects,
    fetchProjects,
    fetchProject,
    generateFromTrack,
    generateFromInspiration,
    generateFromIdea,
    updateComposition,
    renderProject,
    clearError,
    clearSuccess
  }
})
