<template>
  <div class="ot-card flex min-h-0 flex-col p-5">
    <div class="mb-3 flex items-center justify-between">
      <div>
        <p class="ot-label">composition.json</p>
        <h2 class="mt-1 text-lg font-semibold text-ink">可编辑工程</h2>
      </div>
      <button class="ot-button-primary" :disabled="!modelValue" @click="$emit('save')">保存 JSON</button>
    </div>
    <textarea
      :value="modelValue"
      class="ot-terminal min-h-[420px] w-full flex-1 rounded-lg border p-4 font-mono text-xs leading-5 outline-none focus:border-accent"
      spellcheck="false"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <div v-if="errors.length" class="mt-3 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
      <p v-for="error in errors" :key="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  errors: string[]
}>()

defineEmits<{
  'update:modelValue': [value: string]
  save: []
}>()
</script>
