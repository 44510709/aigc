<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import AuthShell from './AuthShell.vue'

const { t } = useI18n()
const form = reactive({ email: '', password: '' })
</script>

<template>
  <AuthShell>
    <div class="auth-card">
      <h2>{{ t('auth.signInTitle') }}</h2>
      <p>
        {{ t('auth.signInHint') }}
        <RouterLink to="/auth/register">{{ t('auth.createAccount') }}</RouterLink>
      </p>

      <el-form label-position="top" :model="form">
        <el-form-item :label="t('auth.email')">
          <el-input v-model="form.email" placeholder="you@example.com" />
        </el-form-item>
        <el-form-item :label="t('auth.password')">
          <el-input v-model="form.password" type="password" show-password placeholder="******" />
        </el-form-item>
        <div class="form-link-row">
          <RouterLink to="#">{{ t('auth.forgot') }}</RouterLink>
        </div>
        <el-button type="primary" class="full-button">{{ t('common.signIn') }}</el-button>
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

.auth-card a,
.form-link-row {
  color: #615ced;
}

.form-link-row {
  margin: -8px 0 16px;
  text-align: right;
  font-size: 13px;
}

.full-button {
  width: 100%;
}
</style>
