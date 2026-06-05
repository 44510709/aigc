<script setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AuthShell from './AuthShell.vue'
import { register } from '../../api/modules/auth'

const { t } = useI18n()
const router = useRouter()

const form = reactive({ username: '', password: '' })
const loading = ref(false)
const errorMsg = ref('')

function handleRegister() {
  if (!form.username || !form.password) {
    errorMsg.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  errorMsg.value = ''
  register({ username: form.username, password: form.password })
    .then((res) => {
      if (res.code === 200) {
        router.push({ name: 'sign-in' })
      } else {
        errorMsg.value = res.msg || '注册失败'
      }
    })
    .catch((err) => {
      errorMsg.value = err.message || '注册失败'
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<template>
  <AuthShell>
    <div class="auth-card">
      <h2>{{ t('auth.createTitle') }}</h2>
      <!-- <p>
        {{ t('auth.already') }}
        <RouterLink :to="{ name: 'sign-in' }">{{ t('common.signIn') }}</RouterLink>
      </p> -->

      <el-alert v-if="errorMsg" :title="errorMsg" type="error" show-icon :closable="false" class="mb-16" />

      <el-form label-position="top" :model="form" @submit.prevent="handleRegister">
        <el-form-item :label="t('auth.username')">
          <el-input v-model="form.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item :label="t('auth.password')">
          <el-input v-model="form.password" type="password" show-password placeholder="密码" />
        </el-form-item>
        <el-button type="primary" class="full-button" :loading="loading" @click="handleRegister">
          {{ t('auth.sendCode') }}
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

.auth-card a {
  color: #615ced;
}

.full-button {
  width: 100%;
}

.mb-16 {
  margin-bottom: 16px;
}
</style>