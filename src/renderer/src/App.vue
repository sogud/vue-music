<template>
  <AppShell />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppShell from './components/layout/AppShell.vue'
import { useThemeStore } from './stores/theme.store'

const theme = useThemeStore()

onMounted(() => {
  void theme.load()
})
</script>
