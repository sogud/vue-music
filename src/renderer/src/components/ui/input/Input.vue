<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  modelModifiers?: {
    trim?: boolean
    number?: boolean
  }
  class?: HTMLAttributes["class"]
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
}>()

const modelValue = computed({
  get: () => props.modelValue ?? props.defaultValue ?? "",
  set: (value) => emits("update:modelValue", normalizeValue(value)),
})

function normalizeValue(value: string | number) {
  let nextValue: string | number = value
  if (props.modelModifiers?.trim && typeof nextValue === "string") {
    nextValue = nextValue.trim()
  }
  if (props.modelModifiers?.number) {
    const parsed = Number.parseFloat(String(nextValue))
    return Number.isNaN(parsed) ? nextValue : parsed
  }
  return nextValue
}
</script>

<template>
  <input
    v-model="modelValue"
    data-slot="input"
    :class="cn(
      'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 border bg-transparent px-3 py-1 text-base shadow-[inset_0_0_0_2px_rgb(var(--ot-line))] transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
      'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
      props.class,
    )"
  >
</template>
