<template>
  <div>
    <p class="ot-label">{{ title }}</p>
    <div class="mt-2 flex flex-wrap gap-2">
      <span v-for="item in items" :key="item" class="ot-tag">{{ item }}</span>
      <span v-if="items.length === 0" class="text-sm text-muted">暂无</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  items: string[]
}>()
</script>
