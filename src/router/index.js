import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../pages/HomeView.vue'),
  },
  {
    path: '/auth/sign-in',
    name: 'sign-in',
    component: () => import('../pages/auth/SignInView.vue'),
  },
  {
    path: '/auth/register',
    name: 'register',
    component: () => import('../pages/auth/RegisterView.vue'),
  },
  {
    path: '/auth/verify',
    name: 'verify-code',
    component: () => import('../pages/auth/VerifyCodeView.vue'),
  },
  {
    path: '/workspace',
    component: () => import('../layouts/WorkspaceLayout.vue'),
    redirect: '/workspace/image-to-video',
    children: [
      {
        path: 'image-to-video',
        name: 'image-to-video',
        component: () => import('../pages/workspace/ImageToVideoView.vue'),
      },
      {
        path: 'script-to-video',
        name: 'script-to-video',
        component: () => import('../pages/workspace/ScriptToVideoView.vue'),
      },
      {
        path: 'assets',
        name: 'asset-library',
        component: () => import('../pages/workspace/AssetLibraryView.vue'),
      },
      {
        path: 'assets/:id',
        name: 'asset-detail',
        component: () => import('../pages/workspace/AssetDetailView.vue'),
      },
      {
        path: 'subjects',
        name: 'subject-management',
        component: () => import('../pages/workspace/SubjectManagementView.vue'),
      },
      {
        path: 'subjects/new',
        name: 'subject-create',
        component: () => import('../pages/workspace/SubjectCreateView.vue'),
      },
      {
        path: 'subjects/:id',
        name: 'subject-detail',
        component: () => import('../pages/workspace/SubjectDetailView.vue'),
      },
      {
        path: 'history',
        name: 'history',
        component: () => import('../pages/workspace/HistoryView.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
