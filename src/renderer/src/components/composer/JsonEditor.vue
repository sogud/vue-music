<template>
  <div class="flex min-h-0 flex-col">
    <div class="mb-3 flex items-center justify-between gap-4">
      <div>
        <p class="ot-label">composition.json</p>
        <h2 class="mt-1 text-base font-semibold text-ink">源码编辑</h2>
      </div>
      <Button variant="outline" :disabled="!modelValue" @click="$emit('save')">保存 JSON</Button>
    </div>
    <Textarea
      :model-value="modelValue"
      class="ot-terminal min-h-[320px] w-full flex-1 rounded-2xl border-0 p-4 font-mono text-xs leading-5 outline-none focus:ring-2 focus:ring-accent/50"
      spellcheck="false"
      @update:model-value="$emit('update:modelValue', String($event))"
    />
    <div v-if="errors.length" class="mt-3 rounded-2xl bg-danger/10 p-3 text-sm text-danger shadow-[inset_0_0_0_1px_rgb(var(--ot-danger)/0.28)]">
      <p v-for="error in errors" :key="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

defineProps<{
  modelValue: string
  errors: string[]
}>()

defineEmits<{
  'update:modelValue': [value: string]
  save: []
}>()
</script>
