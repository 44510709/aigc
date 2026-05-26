<script setup>
import { useI18n } from 'vue-i18n'
import { Bell, UserFilled } from '@element-plus/icons-vue'
import LanguageSwitch from '../components/LanguageSwitch.vue'
import WorkspaceSidebar from '../components/WorkspaceSidebar.vue'

const { t } = useI18n()
</script>

<template>
  <div class="workspace-layout">
    <WorkspaceSidebar class="sidebar" />

    <main class="workspace-main">
      <header class="workspace-topbar">
        <span class="text-muted">{{ t('workspace.topHint') }}</span>
        <div class="topbar-actions">
          <LanguageSwitch />
          <el-button :icon="Bell" circle />
          <el-avatar :size="32" :icon="UserFilled" />
        </div>
      </header>

      <section class="workspace-content">
        <router-view />
      </section>
    </main>
  </div>
</template>

<style scoped>
.workspace-layout {
  display: grid;
  min-height: 100vh;
  grid-template-columns: 224px 1fr;
  background: #f6f7fb;
}

.workspace-main {
  min-width: 0;
}

.workspace-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 58px;
  padding: 0 24px;
  border-bottom: 1px solid #e8ebf2;
  background: #fff;
}

.topbar-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.workspace-content {
  padding: 24px;
}

@media (max-width: 860px) {
  .workspace-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }
}
</style>
