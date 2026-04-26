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
      @delete="onDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import InspirationList from '../components/inspiration/InspirationList.vue'
import { useInspirationStore } from '../stores/inspiration.store'
import { useCreationStore } from '../stores/creation.store'
import { useI18nText } from '../i18n'

const store = useInspirationStore()
const creationStore = useCreationStore()
const { t } = useI18nText()

onMounted(() => {
  store.fetchInspirations()
})

async function onCreateProject(inspirationId: string) {
  await creationStore.createFromInspiration({ inspirationId })
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
