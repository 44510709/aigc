<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Guide } from '@element-plus/icons-vue'
import { LOCALE_STORAGE_KEY } from '../i18n'

const { locale } = useI18n()

const activeLabel = computed(() => (locale.value === 'zh-CN' ? '中文' : 'EN'))

function changeLocale(nextLocale) {
  locale.value = nextLocale
  localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
  document.documentElement.lang = nextLocale
}
</script>

<template>
  <el-dropdown trigger="click" @command="changeLocale">
    <el-button class="language-button" text>
      <el-icon><Guide /></el-icon>
      <span>{{ activeLabel }}</span>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
        <el-dropdown-item command="en-US">English</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped>
.language-button {
  gap: 6px;
}
</style>
