<script setup>
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import LanguageSwitch from './LanguageSwitch.vue'
import { userStore } from '../stores/user'

const { t } = useI18n()

const navItems = [
  { labelKey: 'nav.scriptToVideo', to: '/workspace/script-to-video' },
  { labelKey: 'nav.imageToVideo', to: '/workspace/image-to-video' },
  // { labelKey: 'nav.assetLibrary', to: '/workspace/assets' },
  // { labelKey: 'nav.subjectManagement', to: '/workspace/subjects' },
]

function handleLogout() {
  userStore.logout()
  location.reload()
}
</script>

<template>
  <header class="app-header">
    <RouterLink class="brand" to="/">
      <span class="brand-mark">{{ t('common.logo') }}</span>
      <strong>{{ t('common.appName') }}</strong>
    </RouterLink>

    <nav class="top-nav" aria-label="Main">
      <RouterLink v-for="item in navItems" :key="item.to" :to="item.to">
        {{ t(item.labelKey) }}
      </RouterLink>
    </nav>

    <div class="header-actions">
      <template v-if="userStore.isLoggedIn()">
        <span style="color: #667085; font-size: 13px;">{{ userStore.state.user?.username }}</span>
        <el-button size="small" @click="handleLogout">{{ t('common.signOut') }}</el-button>
      </template>
      <template v-else>
        <RouterLink to="/auth/sign-in">{{ t('common.signIn') }}</RouterLink>
        <RouterLink to="/auth/register">
          <el-button type="primary" size="small">{{ t('common.getStarted') }}</el-button>
        </RouterLink>
      </template>
      <LanguageSwitch />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 24px;
  align-items: center;
  height: 56px;
  padding: 0 28px;
  border-bottom: 1px solid #eef0f5;
  background: rgb(255 255 255 / 92%);
  backdrop-filter: blur(12px);
}

.brand,
.header-actions,
.top-nav {
  display: flex;
  align-items: center;
}

.brand {
  gap: 10px;
  color: #1d2433;
}

.brand-mark {
  color: #615ced;
  font-size: 13px;
  font-weight: 800;
}

.top-nav {
  justify-content: center;
  gap: 28px;
  color: #4b5565;
  font-size: 14px;
}

.top-nav a.router-link-active,
.top-nav a:hover {
  color: #615ced;
}

.header-actions {
  gap: 12px;
  color: #4b5565;
  font-size: 14px;
}

@media (max-width: 920px) {
  .app-header {
    grid-template-columns: 1fr auto;
  }

  .top-nav {
    display: none;
  }
}

@media (max-width: 560px) {
  .app-header {
    padding: 0 14px;
  }

  .header-actions > a:first-child {
    display: none;
  }
}
</style>
