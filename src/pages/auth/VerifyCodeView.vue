<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import AuthShell from './AuthShell.vue'

const { t } = useI18n()
const form = reactive({ code: '' })
</script>

<template>
  <AuthShell>
    <div class="auth-card">
      <h2>{{ t('auth.verifyTitle') }}</h2>
      <p>
        {{ t('auth.already') }}
        <RouterLink to="/auth/sign-in">{{ t('common.signIn') }}</RouterLink>
      </p>

      <el-form label-position="top" :model="form">
        <el-form-item :label="t('auth.verifyCode')">
          <el-input v-model="form.code" maxlength="6" />
        </el-form-item>
        <RouterLink to="/workspace/image-to-video">
          <el-button type="primary" class="full-button">{{ t('auth.confirmCode') }}</el-button>
        </RouterLink>
      </el-form>
    </div>
  </AuthShell>
</template>

<style scoped>
.auth-card h2 {
  margin: 0 0 8px;
  font-size: 24px;
}

.auth-card p {
  margin: 0 0 30px;
  color: #667085;
}

.auth-card a {
  color: #615ced;
}

.full-button {
  width: 100%;
}
</style>
