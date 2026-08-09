<template>
  <section class="ot-render-panel p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="ot-label">Render</p>
        <h2 class="mt-1 text-lg font-semibold text-ink">试听输出</h2>
      </div>
      <Button variant="ghost" size="sm" class="rounded-full" @click="$emit('check')">检测</Button>
    </div>
    <div v-if="status" class="mt-4 rounded-2xl bg-white/[0.055] p-3 text-sm text-muted shadow-[inset_0_0_0_1px_rgb(var(--ot-line)/0.08)]">
      <p class="font-medium" :class="status.canRender ? 'text-ink' : 'text-danger'">
        {{ status.canRender ? '渲染器可用' : '渲染不可用' }}
      </p>
      <p v-if="status.message" class="mt-2 text-danger">{{ status.message }}</p>
    </div>
    <Button class="ot-play-button mt-4 h-12 w-full rounded-full" :disabled="!projectId || loading" @click="$emit('render')">
      {{ loading ? '渲染中' : '生成试听 WAV' }}
    </Button>
    <Button variant="ghost" class="mt-2 w-full rounded-full" :disabled="!projectId" @click="$emit('open')">打开文件夹</Button>
    <div v-if="output" class="mt-4">
      <p class="ot-label">Preview</p>
      <div class="mt-2">
        <MediaChromePlayer :src="output.audioUrl" title="Render output" />
      </div>
    </div>
    <p v-if="error" class="mt-4 text-sm text-danger">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import type { RenderOutput, RenderToolStatus } from '@shared/types'
import { Button } from '@/components/ui/button'
import MediaChromePlayer from '../music/MediaChromePlayer.vue'

defineProps<{
  projectId?: string
  status: RenderToolStatus | null
  output: RenderOutput | null
  loading: boolean
  error: string
}>()

defineEmits<{
  check: []
  render: []
  open: []
}>()
</script>
