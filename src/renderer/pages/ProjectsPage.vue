<template>
  <div>
    <h1>{{ t('projects.title') }}</h1>
    <p class="subtitle">{{ t('projects.subtitle') }}</p>

    <section class="card create-actions">
      <h3>{{ t('projects.createFromTrack') }}</h3>
      <p class="hint" v-if="!currentTrack">{{ t('projects.trackHint') }}</p>
      <button :disabled="!currentTrack || compositionStore.loading" @click="onGenerateFromTrack">
        {{ t('projects.createFromTrack') }}
      </button>
    </section>

    <section class="card create-actions">
      <h3>{{ t('projects.createFromIdea') }}</h3>
      <div class="idea-row">
        <input v-model="ideaInput" :placeholder="t('projects.ideaPlaceholder')" />
        <button :disabled="!ideaInput.trim() || compositionStore.loading" @click="onGenerateFromIdea">
          {{ t('projects.generate') }}
        </button>
      </div>
      <p v-if="!ideaInput.trim()" class="hint">{{ t('projects.ideaHint') }}</p>
    </section>

    <div v-if="compositionStore.loading" class="card state">
      {{ t('projects.loading') }}
    </div>
    <p v-if="compositionStore.error" class="error">{{ compositionStore.error }}</p>

    <section v-if="!compositionStore.loading && !compositionStore.hasProjects" class="card empty">
      <p>{{ t('projects.empty') }}</p>
    </section>

    <section v-for="project in compositionStore.projects" :key="project.id" class="card project-item">
      <div class="project-head">
        <h3>{{ project.title }}</h3>
        <span>{{ sourceLabel(project.sourceType) }}</span>
      </div>
      <p class="meta">
        {{ project.bpm }} {{ t('projects.bpm') }} · {{ project.key }} · {{ project.bars }} {{ t('projects.bars') }}
      </p>
      <p v-if="project.userIdea" class="idea">{{ project.userIdea }}</p>
      <p class="status">
        {{ project.wavPath ? t('projects.wavReady') : t('projects.wavMissing') }}
      </p>
      <div class="actions">
        <button @click="openWorkbench(project.id)">{{ t('projects.openWorkbench') }}</button>
        <button @click="onRender(project.id)">
          {{ t('projects.render') }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCompositionStore } from '../stores/composition.store'
import { useI18nText } from '../i18n'
import { usePlayerStore } from '../stores/player.store'

const router = useRouter()
const store = useCompositionStore()
const playerStore = usePlayerStore()
const { t } = useI18nText()
const ideaInput = ref('')

const currentTrack = computed(() => playerStore.currentTrack)

onMounted(async () => {
  await store.fetchProjects()
})

async function onGenerateFromTrack() {
  if (!currentTrack.value) return
  const project = await store.generateFromTrack({ trackId: currentTrack.value.id })
  if (project) {
    ideaInput.value = ''
    await router.push(`/workbench/${project.id}`)
  }
}

async function onGenerateFromIdea() {
  const userIdea = ideaInput.value.trim()
  if (!userIdea) return
  const project = await store.generateFromIdea({ userIdea })
  if (project) {
    ideaInput.value = ''
    await router.push(`/workbench/${project.id}`)
  }
}

function sourceLabel(type: 'track' | 'inspiration' | 'idea') {
  if (type === 'track') return t('projects.sourceTrack')
  if (type === 'inspiration') return t('projects.sourceInspiration')
  return t('projects.sourceIdea')
}

async function onRender(projectId: string) {
  await store.renderProject({ projectId })
}

function openWorkbench(projectId: string) {
  void router.push(`/workbench/${projectId}`)
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
.create-actions {
  padding: 18px;
  margin-bottom: 16px;
}
.create-actions h3 {
  margin: 0 0 10px;
}
.idea-row {
  display: flex;
  gap: 10px;
}
.hint {
  color: #a39c8e;
  margin: 6px 0 0;
  font-size: 13px;
}
button {
  border: 1px solid #ddd4c7;
  background: #f8f4ec;
  color: #3d382f;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
}
input {
  flex: 1;
  border: 1px solid #ded6c8;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fffdfa;
}
.state {
  margin-bottom: 16px;
  padding: 24px;
  text-align: center;
}
.error {
  color: #b4503f;
  margin-bottom: 12px;
}
.empty {
  padding: 42px;
  text-align: center;
  color: #a39c8e;
}
.project-item {
  padding: 16px;
  margin-bottom: 12px;
}
.project-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}
.project-head h3 {
  margin: 0;
}
.meta {
  color: #7b786d;
  margin: 6px 0 8px;
  font-size: 13px;
}
.idea {
  color: #665d54;
  margin: 4px 0;
  font-size: 13px;
}
.status {
  color: #8f866d;
  margin: 8px 0;
  font-size: 12px;
}
.actions {
  display: flex;
  gap: 10px;
}
</style>
