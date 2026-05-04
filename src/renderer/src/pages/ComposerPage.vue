<template>
  <section class="grid h-screen grid-cols-[260px_minmax(0,1fr)_320px] gap-5 px-6 py-6">
    <aside class="ot-card overflow-hidden p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="ot-label">Projects</p>
          <h2 class="mt-1 text-lg font-semibold text-ink">项目</h2>
        </div>
        <button class="ot-button px-3 py-1.5" @click="projects.load">刷新</button>
      </div>
      <div class="mt-4 grid max-h-[calc(100vh-140px)] gap-2 overflow-auto pr-1">
        <button
          v-for="project in projects.items"
          :key="project.id"
          class="ot-soft-surface rounded-lg p-3 text-left text-sm hover:bg-card"
          :class="{ 'outline outline-1 outline-accent': projects.current?.id === project.id }"
          @click="openProject(project.id)"
        >
          <span class="block truncate font-medium text-ink">{{ project.title }}</span>
          <span class="mt-1 block text-xs text-muted">{{ project.composition.bpm }} BPM · {{ project.composition.bars }} bars</span>
        </button>
        <p v-if="projects.items.length === 0" class="text-sm text-muted">暂无项目。</p>
      </div>
    </aside>

    <main class="grid min-h-0 gap-5 overflow-auto">
      <section class="ot-card p-5">
        <p class="ot-label">Composer</p>
        <h1 class="mt-2 text-2xl font-semibold text-ink">生成 composition.json</h1>
        <div class="mt-5 grid gap-3 md:grid-cols-[1fr_120px_120px]">
          <input v-model="idea" class="ot-input" placeholder="一句话描述你想要的音乐，例如：雨后清晨的轻快电子小品" />
          <input v-model.number="bars" class="ot-input" min="4" max="32" type="number" />
          <input v-model.number="bpm" class="ot-input" min="60" max="160" type="number" />
        </div>
        <input v-model="style" class="ot-input mt-3 w-full" placeholder="可选风格，例如 lo-fi / city pop / piano pop" />
        <div class="mt-4 flex gap-3">
          <button class="ot-button-primary" :disabled="composition.loading || !idea.trim()" @click="generate">
            {{ composition.loading ? '生成中...' : '生成 composition' }}
          </button>
          <button class="ot-button" :disabled="!projects.current" @click="validateCurrent">校验 JSON</button>
        </div>
        <p v-if="composition.error" class="mt-3 text-sm text-danger">{{ composition.error }}</p>
      </section>

      <section v-if="projects.current" class="ot-card p-5">
        <p class="ot-label">Summary</p>
        <div class="mt-3 grid gap-3 md:grid-cols-4">
          <div class="ot-soft-surface rounded-lg p-3">
            <p class="text-xs text-muted">BPM</p>
            <p class="mt-1 text-lg font-semibold text-ink">{{ projects.current.composition.bpm }}</p>
          </div>
          <div class="ot-soft-surface rounded-lg p-3">
            <p class="text-xs text-muted">Key</p>
            <p class="mt-1 text-lg font-semibold text-ink">{{ projects.current.composition.key }}</p>
          </div>
          <div class="ot-soft-surface rounded-lg p-3">
            <p class="text-xs text-muted">Bars</p>
            <p class="mt-1 text-lg font-semibold text-ink">{{ projects.current.composition.bars }}</p>
          </div>
          <div class="ot-soft-surface rounded-lg p-3">
            <p class="text-xs text-muted">Tracks</p>
            <p class="mt-1 text-lg font-semibold text-ink">{{ projects.current.composition.tracks.length }}</p>
          </div>
        </div>
      </section>

      <JsonEditor v-model="jsonText" :errors="validationErrors" @save="saveJson" />
    </main>

    <RenderPanel
      :project-id="projects.current?.id"
      :status="render.status"
      :output="render.output"
      :loading="render.loading"
      :error="render.error"
      @check="render.checkTools"
      @render="renderCurrent"
      @open="openOutput"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { Composition } from '@shared/types'
import JsonEditor from '../components/composer/JsonEditor.vue'
import RenderPanel from '../components/render/RenderPanel.vue'
import { useCompositionStore } from '../stores/composition.store'
import { useProjectStore } from '../stores/project.store'
import { useRenderStore } from '../stores/render.store'

const route = useRoute()
const projects = useProjectStore()
const composition = useCompositionStore()
const render = useRenderStore()

const idea = ref('')
const bars = ref(8)
const bpm = ref<number | undefined>(90)
const style = ref('')
const jsonText = ref('')
const validationErrors = ref<string[]>([])

onMounted(async () => {
  await Promise.all([projects.load(), render.checkTools()])
  if (projects.current) {
    jsonText.value = JSON.stringify(projects.current.composition, null, 2)
  }
})

async function generate() {
  const project = await composition.generateFromIdea({
    idea: idea.value,
    bars: bars.value,
    bpm: bpm.value,
    style: style.value || undefined,
    sourceAnalysisId: route.query.sourceAnalysisId as string | undefined,
    sourceInspirationId: route.query.sourceInspirationId as string | undefined
  })
  await projects.load()
  projects.current = project
  jsonText.value = JSON.stringify(project.composition, null, 2)
  validationErrors.value = []
}

async function openProject(id: string) {
  const project = await projects.open(id)
  jsonText.value = project ? JSON.stringify(project.composition, null, 2) : ''
  validationErrors.value = []
}

async function validateCurrent() {
  if (!jsonText.value) return
  try {
    const parsed = JSON.parse(jsonText.value) as unknown
    const result = await composition.validate(parsed)
    validationErrors.value = result.errors
  } catch (error) {
    validationErrors.value = [error instanceof Error ? error.message : String(error)]
  }
}

async function saveJson() {
  if (!projects.current) return
  try {
    const parsed = JSON.parse(jsonText.value) as Composition
    const result = await composition.validate(parsed)
    validationErrors.value = result.errors
    if (!result.ok) return
    const updated = await projects.updateComposition(projects.current.id, parsed)
    if (updated) jsonText.value = JSON.stringify(updated.composition, null, 2)
  } catch (error) {
    validationErrors.value = [error instanceof Error ? error.message : String(error)]
  }
}

async function renderCurrent() {
  if (!projects.current) return
  await render.renderProject(projects.current.id)
}

async function openOutput() {
  if (!projects.current) return
  await render.openOutputFolder(projects.current.id)
}
</script>
