<template>
  <section class="ot-page-full flex h-full min-h-0 flex-col">
    <header class="ot-page-header shrink-0">
      <div>
        <p class="ot-label">Create</p>
        <h1 class="ot-page-title">创作台</h1>
      </div>
      <Button variant="outline" @click="projects.load">刷新项目</Button>
    </header>

    <div class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px] gap-5 max-[1180px]:grid-cols-1">
      <main class="min-h-0 overflow-y-auto pr-1">
        <section class="ot-create-panel p-5">
          <p class="ot-label">AI Electronic Pattern</p>
          <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_150px_150px_auto]">
            <Input v-model="patternIdea" placeholder="无人声电子乐：深夜 synthwave，低频贝斯，干净鼓组" />
            <Input v-model="style" placeholder="synthwave / deep house" />
            <Input v-model.number="bpm" type="number" min="60" max="160" placeholder="BPM" />
            <Button :disabled="patternGenerating || !patternIdea.trim()" @click="generatePatternWithAi">
              <Sparkles class="mr-2 h-4 w-4" :stroke-width="1.8" />
              {{ patternGenerating ? '生成中' : 'AI 写音乐' }}
            </Button>
          </div>

          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="preset in stylePresets"
              :key="preset"
              class="ot-style-chip"
              :data-active="style === preset || undefined"
              @click="style = style === preset ? '' : preset"
            >
              {{ preset }}
            </button>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-2">
            <span class="text-xs text-muted">生成时长</span>
            <button
              v-for="option in durationOptions"
              :key="option"
              class="ot-style-chip"
              :data-active="patternDurationSeconds === option || undefined"
              @click="patternDurationSeconds = option"
            >
              {{ option }}s
            </button>
            <span class="text-xs text-muted">约 {{ targetBars }} bars / {{ actualDuration }}s</span>
          </div>

          <Textarea
            v-model="patternCode"
            class="ot-compose-input mt-4 min-h-[260px] resize-y p-4 font-mono text-[13px] leading-6 text-ink placeholder:text-muted/65 focus-visible:ring-2 focus-visible:ring-accent/40"
            spellcheck="false"
            @input="persistPattern"
          />

          <div class="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="preset in patternPresets"
                :key="preset.name"
                class="ot-style-chip"
                :data-active="preset.code === patternCode || undefined"
                @click="applyPatternPreset(preset.code)"
              >
                {{ preset.name }}
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <Button variant="outline" @click="stopPattern">
                <SquareIcon class="mr-2 h-4 w-4" :stroke-width="1.8" />
                停止
              </Button>
              <Button variant="outline" :disabled="parsedPattern.errors.length > 0" @click="playPattern">
                <Play class="mr-2 h-4 w-4 fill-current" :stroke-width="1.8" />
                预览
              </Button>
              <Button
                class="ot-play-button"
                :disabled="patternCreating || parsedPattern.errors.length > 0 || parsedPattern.events.length === 0"
                @click="createProjectFromPattern"
              >
                <Sparkles class="mr-2 h-4 w-4" :stroke-width="1.8" />
                {{ patternCreating ? '生成中' : '生成工程' }}
              </Button>
            </div>
          </div>

          <div class="mt-4 grid gap-3 md:grid-cols-3">
            <div class="ot-pattern-stat">
              <span>BPM</span>
              <strong>{{ parsedPattern.tempo }}</strong>
            </div>
            <div class="ot-pattern-stat">
              <span>Source</span>
              <strong>{{ parsedPattern.bars }}</strong>
            </div>
            <div class="ot-pattern-stat">
              <span>Events</span>
              <strong>{{ parsedPattern.events.length }}</strong>
            </div>
          </div>

          <div class="mt-3 flex flex-wrap gap-3 text-sm text-muted">
            <span>{{ patternStatus }}</span>
            <span>{{ parsedPattern.scale }}</span>
            <span v-for="track in parsedPattern.tracks" :key="track.name">{{ track.name }} {{ track.events }}</span>
          </div>
          <p v-if="patternAiNote" class="mt-3 text-sm leading-6 text-muted">{{ patternAiNote }}</p>
          <div v-if="parsedPattern.errors.length || patternError" class="mt-3 grid gap-2">
            <p v-if="patternError" class="text-sm text-danger">{{ patternError }}</p>
            <p v-for="item in parsedPattern.errors" :key="item" class="text-sm text-danger">{{ item }}</p>
          </div>
        </section>

        <Card v-if="projects.current" class="ot-demo-card mt-5 p-5">
          <div class="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
            <div class="ot-demo-visual">
              <div class="ot-demo-bars" aria-hidden="true">
                <span v-for="bar in demoBars" :key="bar.index" :style="{ height: `${bar.height}%` }" />
              </div>
            </div>

            <div class="min-w-0">
              <p class="ot-label">{{ projects.current.composition.key }}</p>
              <h2 class="mt-2 truncate text-3xl font-semibold text-ink">{{ projects.current.title }}</h2>
              <p class="mt-3 line-clamp-2 text-sm leading-6 text-muted">
                {{ projects.current.description || projects.current.userIdea || '已生成 composition，可直接渲染试听。' }}
              </p>

              <div class="mt-5 grid grid-cols-4 gap-2">
                <div v-for="item in summaryItems" :key="item.label" class="rounded-2xl bg-white/[0.055] p-3 shadow-[inset_0_0_0_1px_rgb(var(--ot-line)/0.07)]">
                  <p class="text-xs text-muted">{{ item.label }}</p>
                  <p class="mt-1 text-lg font-semibold text-ink">{{ item.value }}</p>
                </div>
              </div>

              <div class="mt-5 flex flex-wrap gap-2">
                <Button :disabled="render.loading" class="rounded-full" @click="renderCurrent">
                  <Play class="mr-2 h-4 w-4 fill-current" />
                  {{ render.loading ? '渲染中' : '生成试听' }}
                </Button>
                <Button variant="outline" class="rounded-full" @click="validateCurrent">校验</Button>
                <Button variant="ghost" class="rounded-full" @click="advancedOpen = !advancedOpen">
                  {{ advancedOpen ? '收起 JSON' : '编辑 JSON' }}
                </Button>
              </div>

              <p v-if="composition.error" class="mt-4 text-sm text-danger">{{ composition.error }}</p>
            </div>
          </div>
        </Card>

        <Card v-else class="ot-demo-card mt-5 p-6">
          <div class="max-w-xl">
            <p class="ot-label">Start</p>
            <h2 class="mt-2 text-2xl font-semibold text-ink">先写一句电子音乐想法</h2>
            <p class="mt-3 text-sm leading-6 text-muted">oto 会生成无人声 MIDI 工程，之后可以渲染成 WAV，也可以展开 JSON 做精修。</p>
          </div>
        </Card>

        <details :open="advancedOpen" class="ot-action-tile mt-5 rounded-3xl p-5" @toggle="syncAdvancedOpen">
          <summary class="cursor-pointer select-none text-sm font-medium text-ink">高级：composition.json</summary>
          <div class="mt-5">
            <JsonEditor v-model="jsonText" :errors="validationErrors" @save="saveJson" />
          </div>
        </details>
      </main>

      <aside class="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-4 overflow-hidden max-[1180px]:min-h-[420px]">
        <section class="ot-action-tile min-h-0 rounded-3xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="ot-label">Projects</p>
              <h2 class="mt-1 text-lg font-semibold text-ink">最近工程</h2>
            </div>
            <span class="text-xs text-muted">{{ projects.items.length }}</span>
          </div>
          <div class="mt-4 grid max-h-full gap-2 overflow-y-auto pr-1">
            <button
              v-for="project in projects.items"
              :key="project.id"
              class="ot-project-row group"
              :data-active="projects.current?.id === project.id || undefined"
              @click="openProject(project.id)"
            >
              <span class="flex min-w-0 items-start justify-between gap-2">
                <span class="min-w-0">
                  <span class="block truncate text-sm font-medium text-ink">{{ project.title }}</span>
                  <span class="mt-1 block text-xs text-muted">{{ project.composition.bpm }} BPM · {{ project.composition.bars }} bars · {{ project.composition.tracks.length }} tracks</span>
                </span>
                <span
                  class="shrink-0 text-xs text-muted opacity-0 transition group-hover:opacity-100"
                  @click.stop="removeProject(project.id)"
                >
                  删除
                </span>
              </span>
            </button>
            <p v-if="projects.items.length === 0" class="rounded-2xl bg-white/[0.045] p-4 text-sm text-muted">还没有工程</p>
          </div>
        </section>

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
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Play, Sparkles, Square as SquareIcon } from 'lucide-vue-next'
import type { Composition } from '@shared/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import JsonEditor from '../components/composer/JsonEditor.vue'
import RenderPanel from '../components/render/RenderPanel.vue'
import { useCompositionStore } from '../stores/composition.store'
import { useProjectStore } from '../stores/project.store'
import { useRenderStore } from '../stores/render.store'
import {
  durationForBars,
  parsePattern,
  PatternPlayer,
  patternToComposition,
  targetBarsForDuration
} from '@/lib/pattern-engine'
import { patternApi } from '@/api/pattern.api'

const projects = useProjectStore()
const composition = useCompositionStore()
const render = useRenderStore()

const bpm = ref<number | undefined>(90)
const style = ref('')
const jsonText = ref('')
const validationErrors = ref<string[]>([])
const advancedOpen = ref(false)
const stylePresets = ['synthwave', 'deep house', 'ambient techno', 'future bass', 'lo-fi electronic', 'drum and bass', 'IDM']
const patternStorageKey = 'oto.pattern.code'
const defaultPatternCode = `tempo 124
scale E minor

drums:
  kick  x... x... x... x...
  snare ..x. ..x. ..x. ..x.
  hat   x x x x x x x x

bass:
  notes E2 E2 G2 B2 D3 B2
  rhythm 1/2 1/2 1/2 1/2 1/2 1/2
  sound warm_bass

chords:
  notes E3 G3 B3 | C3 E3 G3 | D3 F#3 A3 | B2 D3 F#3
  rhythm 1 1 1 1
  sound pad

lead:
  notes E4 G4 B4 D5
  rhythm 1/4 1/4 1/2 1
  sound soft_sine`
const patternPresets = [
  { name: 'Synthwave Pulse', code: defaultPatternCode },
  {
    name: 'Ambient Pad',
    code: `tempo 88
scale D minor

drums:
  kick  x... .... x... ....
  snare .... ..x. .... ..x.
  hat   x . x . x . x .

chords:
  notes D3 F3 A3 | Bb2 D3 F3 | C3 E3 G3 | A2 C3 E3
  rhythm 1 1 1 1
  sound pad

lead:
  notes A4 C5 D5 F5 E5
  rhythm 1/2 1/2 1/2 1/2 1
  sound soft_sine`
  },
  {
    name: 'Deep House Bass',
    code: `tempo 108
scale E minor

drums:
  kick  x... x... x... x...
  snare ..x. ..x. ..x. ..x.
  hat   x x x x x x x x

bass:
  notes E2 B2 E3 G2 E2 B2 D3 B2
  rhythm 1/2 1/2 1/2 1/2 1/2 1/2 1/2 1/2
  sound warm_bass

chords:
  notes E3 G3 B3 | G3 B3 D4 | A3 C4 E4 | B2 D3 F#3
  rhythm 1 1 1 1
  sound pad`
  }
]
const patternCode = ref(localStorage.getItem(patternStorageKey) || defaultPatternCode)
const patternIdea = ref('')
const patternDurationSeconds = ref(30)
const patternStatus = ref('未播放')
const patternError = ref('')
const patternAiNote = ref('')
const patternGenerating = ref(false)
const patternCreating = ref(false)
const patternPlayer = new PatternPlayer()
const parsedPattern = computed(() => parsePattern(patternCode.value))
const durationOptions = [15, 30, 45, 60]
const targetBars = computed(() => targetBarsForDuration(parsedPattern.value.tempo, patternDurationSeconds.value))
const actualDuration = computed(() => durationForBars(parsedPattern.value.tempo, targetBars.value))

const summaryItems = computed(() => {
  const current = projects.current?.composition
  if (!current) return []
  return [
    { label: 'BPM', value: current.bpm },
    { label: 'Bars', value: current.bars },
    { label: 'Tracks', value: current.tracks.length },
    { label: 'Notes', value: current.tracks.reduce((sum, track) => sum + track.notes.length, 0) }
  ]
})

const demoBars = computed(() => {
  const tracks = projects.current?.composition.tracks ?? []
  const seed = tracks.reduce((sum, track) => sum + track.notes.length * (track.channel + 1), 17)
  return Array.from({ length: 28 }, (_, index) => ({
    index,
    height: 18 + ((seed + index * 19) % 74)
  }))
})

onMounted(async () => {
  await Promise.all([projects.load(), render.checkTools()])
  if (!projects.current && projects.items[0]) {
    await openProject(projects.items[0].id)
    return
  }
  if (projects.current) {
    jsonText.value = JSON.stringify(projects.current.composition, null, 2)
  }
})

onBeforeUnmount(() => {
  patternPlayer.stop()
})

async function openProject(id: string) {
  const project = await projects.open(id)
  jsonText.value = project ? JSON.stringify(project.composition, null, 2) : ''
  validationErrors.value = []
  advancedOpen.value = false
}

async function removeProject(id: string) {
  await projects.remove(id)
  if (projects.current?.id === id) {
    jsonText.value = ''
    validationErrors.value = []
    advancedOpen.value = false
  }
}

async function validateCurrent() {
  if (!jsonText.value) return
  try {
    const parsed = JSON.parse(jsonText.value) as unknown
    const result = await composition.validate(parsed)
    validationErrors.value = result.errors
    advancedOpen.value = !result.ok
  } catch (error) {
    validationErrors.value = [error instanceof Error ? error.message : String(error)]
    advancedOpen.value = true
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

function syncAdvancedOpen(event: Event) {
  advancedOpen.value = (event.currentTarget as HTMLDetailsElement).open
}

async function playPattern() {
  patternError.value = ''
  try {
    await patternPlayer.play(parsedPattern.value, { durationSeconds: patternDurationSeconds.value })
    patternStatus.value = '播放中'
  } catch (error) {
    patternError.value = error instanceof Error ? error.message : String(error)
  }
}

function stopPattern() {
  patternPlayer.stop()
  patternStatus.value = '已停止'
}

function applyPatternPreset(nextCode: string) {
  patternCode.value = nextCode
  persistPattern()
  patternStatus.value = '已载入'
}

function persistPattern() {
  localStorage.setItem(patternStorageKey, patternCode.value)
}

async function generatePatternWithAi() {
  patternGenerating.value = true
  patternError.value = ''
  try {
    const result = await patternApi.generate({
      idea: patternIdea.value,
      style: style.value || undefined,
      bpm: bpm.value || undefined,
      bars: targetBars.value
    })
    patternCode.value = result.code
    patternAiNote.value = `${result.title}: ${result.notes}`
    persistPattern()
    patternStatus.value = 'AI 已生成'
  } catch (error) {
    patternError.value = error instanceof Error ? error.message : String(error)
  } finally {
    patternGenerating.value = false
  }
}

async function createProjectFromPattern() {
  patternCreating.value = true
  patternError.value = ''
  try {
    const title = patternAiNote.value.split(':')[0] || patternIdea.value || 'Pattern Sketch'
    const generated = patternToComposition(parsedPattern.value, title, {
      durationSeconds: patternDurationSeconds.value
    })
    const result = await composition.validate(generated)
    if (!result.ok) {
      patternError.value = result.errors.join('; ')
      return
    }
    const project = await projects.create({
      title: generated.title,
      description: generated.description,
      composition: generated
    })
    jsonText.value = JSON.stringify(project.composition, null, 2)
    validationErrors.value = []
    advancedOpen.value = false
  } catch (error) {
    patternError.value = error instanceof Error ? error.message : String(error)
  } finally {
    patternCreating.value = false
  }
}
</script>

<style scoped>
.ot-tab-switch {
  display: flex;
  gap: 3px;
  border-radius: 999px;
  padding: 4px;
  background: rgb(var(--ot-soft) / 0.72);
}

.ot-tab-switch button {
  border-radius: 999px;
  padding: 8px 14px;
  color: rgb(var(--ot-muted));
  font-size: 13px;
}

.ot-tab-switch button[data-active] {
  background: rgb(var(--ot-card));
  color: rgb(var(--ot-ink));
  box-shadow: 0 8px 20px rgb(var(--ot-shadow) / 0.1);
}

.ot-code-workbench {
  overflow: hidden;
  border-radius: 22px;
  background: rgb(var(--ot-card) / 0.72);
  box-shadow:
    inset 0 0 0 1px rgb(var(--ot-line) / 0.08),
    0 18px 46px rgb(var(--ot-shadow) / 0.12);
}

.ot-pattern-stat {
  border-radius: 14px;
  padding: 12px;
  background: rgb(var(--ot-soft) / 0.54);
}

.ot-pattern-stat span {
  display: block;
  color: rgb(var(--ot-muted));
  font-size: 12px;
}

.ot-pattern-stat strong {
  display: block;
  margin-top: 4px;
  color: rgb(var(--ot-ink));
  font-size: 18px;
}

.ot-quick-row[data-active] {
  color: rgb(var(--ot-ink));
  background: rgb(var(--ot-card) / 0.9);
  box-shadow:
    inset 0 0 0 1px rgb(var(--ot-accent) / 0.24),
    0 8px 22px rgb(var(--ot-shadow) / 0.1);
}
</style>
