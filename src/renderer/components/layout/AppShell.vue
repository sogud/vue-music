<template>
  <div class="layout">
    <SideNav />
    <main class="content">
      <TopSearch />
      <router-view />
    </main>
    <AssistantPanel />
    <MiniPlayer />
  </div>
</template>

<script setup lang="ts">
import SideNav from './SideNav.vue'
import TopSearch from './TopSearch.vue'
import AssistantPanel from '../AssistantPanel.vue'
import MiniPlayer from '../MiniPlayer.vue'
</script>
