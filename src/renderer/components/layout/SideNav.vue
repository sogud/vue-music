<template>
  <aside class="sidebar card soft">
    <div class="brand">muse.</div>
    <nav>
      <router-link
        v-for="item in items"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        active-class="active"
      >
        {{ item.label }}
      </router-link>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18nText } from '../../i18n'

const { t } = useI18nText()

const navItems = [
  { path: '/', key: 'nav.home' },
  { path: '/inspiration', key: 'nav.inspiration' },
  { path: '/analysis', key: 'nav.analysis' },
  { path: '/creation', key: 'nav.creation' },
  { path: '/settings', key: 'nav.settings' }
]

const items = computed(() => navItems.map((item) => ({ ...item, label: t(item.key) })))
</script>
