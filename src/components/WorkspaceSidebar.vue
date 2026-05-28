<script setup>
import { useI18n } from 'vue-i18n'
import {
  Collection,
  Film,
  FolderOpened,
  House,
  Picture,
  User,
} from '@element-plus/icons-vue'

const { t } = useI18n()

const menuItems = [
  { labelKey: 'nav.home', to: '/', icon: House },
  { labelKey: 'nav.imageToVideo', to: '/workspace/image-to-video', icon: Picture },
  { labelKey: 'nav.scriptToVideo', to: '/workspace/script-to-video', icon: Film },
  // { labelKey: 'nav.assetLibrary', to: '/workspace/assets', icon: FolderOpened },
  // { labelKey: 'nav.subjectManagement', to: '/workspace/subjects', icon: User },
  // { labelKey: 'nav.history', to: '/workspace/history', icon: Collection },
]
</script>

<template>
  <aside class="workspace-sidebar">
    <RouterLink class="sidebar-brand" to="/">
      <span>{{ t('common.logo') }}</span>
      <strong>{{ t('common.appName') }}</strong>
    </RouterLink>

    <nav class="sidebar-nav" aria-label="Workspace">
      <RouterLink v-for="item in menuItems" :key="item.to" :to="item.to">
        <el-icon><component :is="item.icon" /></el-icon>
        <span>{{ t(item.labelKey) }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.workspace-sidebar {
  min-height: 100vh;
  padding: 22px 14px;
  border-right: 1px solid #e8ebf2;
  background: #fff;
}

.sidebar-brand {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 0 10px 22px;
}

.sidebar-brand span {
  color: #615ced;
  font-size: 13px;
  font-weight: 800;
}

.sidebar-nav {
  display: grid;
  gap: 6px;
}

.sidebar-nav a {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  color: #475467;
  font-size: 14px;
}

.sidebar-nav a.router-link-active,
.sidebar-nav a:hover {
  color: #514be2;
  background: #eef0ff;
}
</style>
