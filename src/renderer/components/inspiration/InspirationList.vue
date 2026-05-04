<template>
  <div class="inspiration-grid">
    <InspirationCard
      v-for="inspiration in inspirations"
      :key="inspiration.id"
      :inspiration="inspiration"
      @create-project="$emit('create-project', $event)"
      @generate-composition="$emit('generate-composition', $event)"
      @delete="$emit('delete', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Inspiration } from '@shared/types'
import InspirationCard from './InspirationCard.vue'

defineProps<{
  inspirations: Inspiration[]
}>()

defineEmits<{
  'create-project': [id: string]
  'generate-composition': [id: string]
  'delete': [id: string]
}>()
</script>

<style scoped>
.inspiration-grid {
  display: grid;
  gap: 16px;
}
</style>
