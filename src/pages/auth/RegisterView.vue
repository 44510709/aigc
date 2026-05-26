<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import AuthShell from './AuthShell.vue'

const { t } = useI18n()
const form = reactive({ name: '', email: '', password: '' })
</script>

<template>
  <AuthShell>
    <div class="auth-card">
      <h2>{{ t('auth.createTitle') }}</h2>
      <p>
        {{ t('auth.already') }}
        <RouterLink to="/auth/sign-in">{{ t('common.signIn') }}</RouterLink>
      </p>

      <el-form label-position="top" :model="form">
        <el-form-item :label="t('auth.fullName')">
          <el-input v-model="form.name" placeholder="John Doe" />
        </el-form-item>
        <el-form-item :label="t('auth.email')">
          <el-input v-model="form.email" placeholder="you@example.com" />
        </el-form-item>
        <el-form-item :label="t('auth.password')">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <RouterLink to="/auth/verify">
          <el-button type="primary" class="full-button">{{ t('auth.sendCode') }}</el-button>
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
