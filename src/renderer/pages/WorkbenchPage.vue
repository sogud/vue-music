<template>
  <div>
    <h1>{{ t('workbench.title') }}</h1>
    <p class="subtitle">{{ t('workbench.subtitle') }}</p>

    <div v-if="store.loading" class="card state">
      {{ t('workbench.loading') }}
    </div>

    <div v-else-if="!project" class="card empty">
      {{ t('workbench.notFound') }}
    </div>

    <template v-else>
      <section class="card workbench-meta">
        <h3>{{ project.title }}</h3>
        <p>{{ project.bpm }} {{ t('projects.bpm') }} · {{ project.key }} · {{ project.bars }} {{ t('projects.bars') }}</p>
        <p v-if="project.sourceTitle" class="meta">{{ project.sourceTitle }}</p>
        <p v-if="project.userIdea" class="meta">{{ project.userIdea }}</p>
        <audio v-if="audioUrl" :src="audioUrl" controls class="audio-player"></audio>
        <p v-else class="hint">{{ t('projects.wavMissing') }}</p>
      </section>

      <section class="card">
        <h3>{{ t('workbench.compositionJson') }}</h3>
        <textarea v-model="compositionText" rows="18" class="json-editor"></textarea>
        <div class="actions">
          <button :disabled="store.saving" @click="onSave">{{ t('workbench.save') }}</button>
          <button :disabled="store.rendering" @click="onRender">{{ t('workbench.render') }}</button>
        </div>
        <p v-if="parseError" class="error">{{ t('workbench.invalidJson') }}</p>
        <p v-if="store.lastSuccess && !parseError" class="success">{{ store.lastSuccess }}</p>
        <p v-if="store.error" class="error">{{ store.error }}</p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCompositionStore } from '../stores/composition.store'
import { useI18nText } from '../i18n'

const route = useRoute()
const router = useRouter()
const store = useCompositionStore()
const { t } = useI18nText()
const compositionText = ref('')
const parseError = ref(false)

const project = computed(() => store.currentProject)

const audioUrl = computed(() => {
  if (!project.value?.wavPath) return ''
  const normalized = project.value.wavPath.replace(/\\/g, '/')
  return `file://${encodeURI(normalized)}`
})

function routeProjectId() {
  return (route.params.projectId as string | undefined)?.trim()
}

async function loadProject() {
  const id = routeProjectId()
  if (!id) {
    await router.replace('/projects')
    return
  }
  const loaded = await store.fetchProject(id)
  if (!loaded) {
    await router.replace('/projects')
  }
}

function syncJsonText() {
  const current = project.value
  if (!current) {
    compositionText.value = ''
    return
  }
  compositionText.value = JSON.stringify(current.composition, null, 2)
}

onMounted(loadProject)
watch(
  () => route.params.projectId,
  () => {
    loadProject()
  }
)
watch(project, () => {
  syncJsonText()
}, { immediate: true, deep: true })

function safeParseComposition(): string | null {
  try {
    JSON.parse(compositionText.value)
    parseError.value = false
    return compositionText.value
  } catch {
    parseError.value = true
    return null
  }
}

async function onSave() {
  const projectId = routeProjectId()
  if (!projectId) return
  store.clearError()
  store.clearSuccess()
  const compositionJson = safeParseComposition()
  if (!compositionJson) return
  try {
    await store.updateComposition({ projectId, compositionJson })
    store.lastSuccess = t('workbench.saved')
    syncJsonText()
  } catch {
    // error message already on store
  }
}

async function onRender() {
  const projectId = routeProjectId()
  if (!projectId) return
  store.clearError()
  store.clearSuccess()
  const compositionJson = safeParseComposition()
  if (!compositionJson) return
  try {
    await store.renderProject({ projectId, compositionJson })
    store.lastSuccess = t('workbench.renderDone')
  } catch {
    // error message already on store
  }
}
</script>

<style scoped>
h1 {
  margin: 0;
  font-weight: 550;
}
.subtitle {
  color: #80796e;
  margin: 4px 0 20px;
}
.workbench-meta {
  padding: 18px;
  margin-bottom: 16px;
}
.meta {
  margin: 6px 0;
  color: #6f675d;
  font-size: 13px;
}
.state,
.empty {
  padding: 42px;
  text-align: center;
  color: #a39c8e;
}
.audio-player {
  margin-top: 12px;
  width: 100%;
}
.json-editor {
  width: 100%;
  min-height: 320px;
  border: 1px solid #ded6c8;
  border-radius: 10px;
  padding: 12px;
  background: #fffdfa;
  font-family: Menlo, Monaco, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
}
.actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}
button {
  border: 1px solid #ddd4c7;
  background: #f8f4ec;
  color: #3d382f;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
}
.hint {
  color: #a39c8e;
  font-size: 13px;
}
.error {
  color: #c44;
  margin-top: 10px;
}
.success {
  color: #5a9f48;
  margin-top: 10px;
}
</style>
