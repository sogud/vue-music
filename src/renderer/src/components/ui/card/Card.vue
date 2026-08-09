<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'bg-card text-card-foreground flex flex-col gap-6 border py-6 shadow-[inset_0_0_0_2px_rgb(var(--ot-line)),5px_5px_0_rgb(var(--ot-shadow))]',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
