<script setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AuthShell from './AuthShell.vue'
import { userStore } from '../../stores/user'

const { t } = useI18n()
const router = useRouter()

const form = reactive({ username: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')

function handleLogin() {
  if (!form.username || !form.password) {
    errorMsg.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  errorMsg.value = ''
  userStore.login(form.username, form.password)
    .then(() => {
      router.push({ name: 'home' })
    })
    .catch((err) => {
      errorMsg.value = err.message || '登录失败'
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<template>
  <AuthShell>
    <div class="auth-card">
      <h2>{{ t('auth.signInTitle') }}</h2>
      <!-- <p>
        {{ t('auth.signInHint') }}
        <RouterLink :to="{ name: 'register' }">{{ t('auth.createAccount') }}</RouterLink>
      </p> -->

      <el-alert v-if="errorMsg" :title="errorMsg" type="error" show-icon :closable="false" class="mb-16" />

      <el-form label-position="top" :model="form" @submit.prevent="handleLogin">
        <el-form-item :label="t('auth.username')">
          <el-input v-model="form.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item :label="t('auth.password')">
          <el-input v-model="form.password" type="password" show-password placeholder="******" />
        </el-form-item>
        <div class="form-link-row">
          <RouterLink to="#">{{ t('auth.forgot') }}</RouterLink>
        </div>
        <el-button type="primary" class="full-button" :loading="loading" @click="handleLogin">
          {{ t('common.signIn') }}
        </el-button>
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

.mb-16 {
  margin-bottom: 16px;
}
</style>