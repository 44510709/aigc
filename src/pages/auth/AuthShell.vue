<script setup>
import { useI18n } from 'vue-i18n'
import { VideoPlay } from '@element-plus/icons-vue'
import LanguageSwitch from '../../components/LanguageSwitch.vue'

const { t } = useI18n()
</script>

<template>
  <div class="auth-page page">
    <section class="auth-visual">
      <RouterLink class="auth-logo" :to="{ name: 'home' }">
        <span>{{ t('common.logo') }}</span>
        <strong>{{ t('common.appName') }}</strong>
      </RouterLink>
      <h1>{{ t('auth.startTitle') }}</h1>
      <p>{{ t('auth.startDesc') }}</p>
      <div class="play-circle">
        <el-icon><VideoPlay /></el-icon>
      </div>
      <small>{{ t('auth.trust') }}</small>
    </section>

    <section class="auth-form-section">
      <div class="auth-language">
        <LanguageSwitch />
      </div>
      <slot />
      <footer>
        <RouterLink to="#">{{ t('auth.privacy') }}</RouterLink>
        <RouterLink to="#">{{ t('auth.terms') }}</RouterLink>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.auth-page {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(360px, 1fr);
  background: #fff;
}

.auth-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 42px;
  text-align: center;
  background: linear-gradient(145deg, #eef0ff, #f7f4ff);
}

.auth-logo {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 34px;
}

.auth-logo span {
  display: inline-grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 8px;
  color: #fff;
  background: #615ced;
  font-size: 10px;
  font-weight: 800;
}

.auth-visual h1 {
  max-width: 420px;
  margin: 0 0 14px;
  font-size: 30px;
  line-height: 1.2;
}

.auth-visual p {
  max-width: 440px;
  margin: 0;
  color: #667085;
}

.play-circle {
  display: grid;
  width: 150px;
  height: 150px;
  margin: 42px 0;
  place-items: center;
  border-radius: 50%;
  color: #8a94a6;
  background: #e4e7ec;
  font-size: 42px;
}

.auth-visual small {
  color: #667085;
}

.auth-form-section {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  padding: 64px 11vw;
}

.auth-language {
  position: absolute;
  top: 24px;
  right: 28px;
}

.auth-form-section footer {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 64px;
  padding-top: 28px;
  border-top: 1px solid #eef0f5;
  color: #667085;
  font-size: 13px;
}

@media (max-width: 860px) {
  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-visual {
    min-height: 360px;
  }

  .auth-form-section {
    min-height: auto;
    padding: 54px 24px;
  }
}
</style>
