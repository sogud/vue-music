<template>
  <div>
    <h1>{{ t('creation.title') }}</h1>
    <p class="subtitle">{{ t('creation.subtitle') }}</p>

    <div class="create-section card">
      <h3>{{ t('creation.start') }}</h3>
      <div class="idea-row">
        <input v-model="userIdea" :placeholder="t('creation.ideaPlaceholder')" />
        <button @click="onCreateFromIdea">{{ t('creation.generate') }}</button>
      </div>
    </div>

    <div v-if="store.loading" class="card" style="padding: 32px; text-align: center; margin-top: 16px">
      <p>{{ t('creation.loading') }}</p>
    </div>

    <div v-for="project in store.projects" :key="project.id" class="project-section">
      <h3>{{ project.title }}</h3>
      <p v-if="project.userIdea" class="idea">{{ project.userIdea }}</p>
      <CreationDirectionCard
        v-for="direction in project.directions"
        :key="direction.id"
        :direction="direction"
      />
    </div>

    <div v-if="store.projects.length === 0 && !store.loading" class="empty card">
      <p>{{ t('creation.empty') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CreationDirectionCard from '../components/creation/CreationDirectionCard.vue'
import { useCreationStore } from '../stores/creation.store'
import { useI18nText } from '../i18n'

const store = useCreationStore()
const userIdea = ref('')
const { t } = useI18nText()

onMounted(() => {
  store.fetchProjects()
})

async function onCreateFromIdea() {
  if (!userIdea.value.trim()) return
  await store.createFromIdea({ userIdea: userIdea.value.trim() })
  userIdea.value = ''
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
.create-section {
  padding: 18px;
  margin-bottom: 20px;
}
.create-section h3 {
  margin: 0 0 12px 0;
}
.idea-row {
  display: flex;
  gap: 10px;
}
.idea-row input {
  flex: 1;
  border: 1px solid #ded6c8;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fffdfa;
}
button {
  border: 1px solid #ddd4c7;
  background: #f8f4ec;
  color: #3d382f;
  border-radius: 10px;
  padding: 8px 16px;
  cursor: pointer;
  white-space: nowrap;
}
.idea {
  color: #6d665d;
  margin: 4px 0 12px;
}
.project-section {
  margin-top: 24px;
}
.project-section h3 {
  margin: 0 0 4px;
}
.empty {
  padding: 48px;
  text-align: center;
  color: #a39c8e;
}
.actions button {
  border: 1px solid #ddd4c7;
  background: #f8f4ec;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
}
</style>
