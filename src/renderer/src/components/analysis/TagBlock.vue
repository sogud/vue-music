<template>
  <div>
    <p class="ot-label">{{ title }}</p>
    <div class="mt-2 flex flex-wrap gap-2">
      <Badge v-for="item in items" :key="item" variant="secondary">{{ item }}</Badge>
      <span v-if="items.length === 0" class="text-sm text-muted">暂无</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'

defineProps<{
  title: string
  items: string[]
}>()
</script>
