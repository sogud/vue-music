<template>
  <aside class="ot-card p-5">
    <p class="ot-label">Renderer</p>
    <h2 class="mt-2 text-lg font-semibold text-ink">渲染输出</h2>
    <button class="ot-button mt-4 w-full" @click="$emit('check')">检查环境</button>
    <div v-if="status" class="ot-soft-surface mt-4 rounded-lg p-3 text-sm text-muted">
      <p>FluidSynth：{{ status.fluidsynthAvailable ? '可用' : '不可用' }}</p>
      <p>SoundFont：{{ status.soundFontConfigured ? '已配置' : '未配置' }}</p>
      <p v-if="status.message" class="mt-2 text-danger">{{ status.message }}</p>
    </div>
    <button class="ot-button-primary mt-4 w-full" :disabled="!projectId || loading" @click="$emit('render')">
      {{ loading ? '渲染中...' : '渲染 WAV' }}
    </button>
    <button class="ot-button mt-3 w-full" :disabled="!projectId" @click="$emit('open')">打开输出目录</button>
    <div v-if="output" class="mt-5">
      <p class="ot-label">Audio preview</p>
      <audio :src="output.audioUrl" controls class="mt-3 w-full" />
      <p class="mt-3 break-all text-xs text-muted">{{ output.wavPath }}</p>
    </div>
    <p v-if="error" class="mt-4 text-sm text-danger">{{ error }}</p>
  </aside>
</template>

<script setup lang="ts">
import type { RenderOutput, RenderToolStatus } from '@shared/types'

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
