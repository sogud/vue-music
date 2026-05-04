import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import ListenPage from '../pages/ListenPage.vue'
import AnalysisPage from '../pages/AnalysisPage.vue'
import InspirationPage from '../pages/InspirationPage.vue'
import ComposerPage from '../pages/ComposerPage.vue'
import ProjectPage from '../pages/ProjectPage.vue'
import SettingsPage from '../pages/SettingsPage.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/listen', name: 'listen', component: ListenPage },
    { path: '/analysis', name: 'analysis', component: AnalysisPage },
    { path: '/inspiration', name: 'inspiration', component: InspirationPage },
    { path: '/composer', name: 'composer', component: ComposerPage },
    { path: '/projects', name: 'projects', component: ProjectPage },
    { path: '/settings', name: 'settings', component: SettingsPage }
  ]
})

export default router
