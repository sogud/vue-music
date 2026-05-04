<template>
  <section class="mx-auto max-w-6xl px-8 py-10">
    <header class="flex items-start justify-between">
      <div>
        <p class="ot-label">Projects</p>
        <h1 class="mt-2 text-3xl font-semibold text-ink">项目</h1>
      </div>
      <button class="ot-button-primary" @click="router.push('/composer')">新建创作</button>
    </header>

    <div v-if="projects.items.length === 0" class="ot-card mt-8 p-7 text-sm text-muted">
      暂无项目。可以从创作台生成 composition.json。
    </div>

    <div v-else class="mt-8 grid gap-4 md:grid-cols-2">
      <article v-for="project in projects.items" :key="project.id" class="ot-card p-5">
        <p class="ot-label">{{ project.composition.key }}</p>
        <h2 class="mt-2 text-xl font-semibold text-ink">{{ project.title }}</h2>
        <p class="mt-2 text-sm text-muted">
          {{ project.composition.bpm }} BPM · {{ project.composition.bars }} bars · {{ project.composition.tracks.length }} tracks
        </p>
        <div class="mt-5 flex gap-3">
          <button class="ot-button-primary" @click="open(project.id)">打开</button>
          <button class="ot-button text-danger hover:border-danger hover:text-danger" @click="projects.remove(project.id)">删除</button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '../stores/project.store'

const router = useRouter()
const projects = useProjectStore()

onMounted(() => projects.load())

async function open(id: string) {
  await projects.open(id)
  router.push('/composer')
}
</script>
