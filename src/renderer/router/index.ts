import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/HomePage.vue'),
      alias: '/listen'
    },
    {
      path: '/inspiration',
      name: 'inspiration',
      component: () => import('../pages/InspirationPage.vue')
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: () => import('../pages/AnalysisPage.vue')
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('../pages/ProjectsPage.vue')
    },
    {
      path: '/creation',
      name: 'creation',
      component: () => import('../pages/CreationPage.vue')
    },
    {
      path: '/workbench/:projectId?',
      name: 'workbench',
      component: () => import('../pages/WorkbenchPage.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../pages/SettingsPage.vue')
    }
  ]
})

export default router
