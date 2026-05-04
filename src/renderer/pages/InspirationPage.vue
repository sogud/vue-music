<template>
  <div>
    <h1>{{ t('inspiration.title') }}</h1>
    <p class="subtitle">{{ t('inspiration.subtitle') }}</p>

    <div v-if="store.inspirations.length === 0 && !store.loading" class="empty card">
      <p>{{ t('inspiration.empty') }}</p>
    </div>

    <InspirationList
      :inspirations="store.inspirations"
      @create-project="onCreateProject"
      @generate-composition="onGenerateComposition"
      @delete="onDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import InspirationList from '../components/inspiration/InspirationList.vue'
import { useInspirationStore } from '../stores/inspiration.store'
import { useCreationStore } from '../stores/creation.store'
import { useCompositionStore } from '../stores/composition.store'
import { useI18nText } from '../i18n'

const store = useInspirationStore()
const creationStore = useCreationStore()
const compositionStore = useCompositionStore()
const router = useRouter()
const { t } = useI18nText()

onMounted(() => {
  store.fetchInspirations()
})

async function onCreateProject(inspirationId: string) {
  await creationStore.createFromInspiration({ inspirationId })
}

async function onGenerateComposition(inspirationId: string) {
  const project = await compositionStore.generateFromInspiration({ inspirationId })
  if (project?.id) {
    await router.push(`/workbench/${project.id}`)
  }
}

async function onDelete(id: string) {
  await store.removeInspiration(id)
}
</script>

<style scoped>
h1 {
  margin: 0;
  font-weight: 550;
}
.subtitle {
  color: #80796e;
  margin: 4px 0 20px;
}
.empty {
  padding: 48px;
  text-align: center;
  color: #a39c8e;
}
</style>
