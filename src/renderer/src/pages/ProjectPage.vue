<template>
  <section class="ot-page">
    <header class="ot-page-header">
      <div>
        <p class="ot-label">Projects</p>
        <h1 class="ot-page-title">项目</h1>
      </div>
      <Button @click="router.push('/composer')">新建</Button>
    </header>

    <Card v-if="projects.items.length === 0" class="p-7 text-sm text-muted">
      暂无项目
    </Card>

    <div v-else class="grid gap-4 md:grid-cols-2">
      <Card v-for="project in projects.items" :key="project.id" class="p-5">
        <Badge variant="outline">{{ project.composition.key }}</Badge>
        <h2 class="mt-3 text-xl font-semibold text-ink">{{ project.title }}</h2>
        <p class="mt-2 text-sm text-muted">{{ project.composition.bpm }} BPM · {{ project.composition.bars }} bars · {{ project.composition.tracks.length }} tracks</p>
        <div class="mt-5 flex gap-3">
          <Button @click="open(project.id)">打开</Button>
          <Button variant="outline" class="text-danger hover:border-danger hover:text-danger" @click="projects.remove(project.id)">删除</Button>
        </div>
      </Card>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useProjectStore } from '../stores/project.store'

const router = useRouter()
const projects = useProjectStore()

onMounted(() => projects.load())

async function open(id: string) {
  await projects.open(id)
  router.push('/composer')
}
</script>
