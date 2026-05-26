import { createI18n } from 'vue-i18n'
import enUS from './locales/en-US'
import zhCN from './locales/zh-CN'

export const SUPPORT_LOCALES = ['zh-CN', 'en-US']
export const LOCALE_STORAGE_KEY = 'aigc-locale'

function getDefaultLocale() {
  const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY)

  if (SUPPORT_LOCALES.includes(savedLocale)) {
    return savedLocale
  }

  return navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US'
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'en-US',
  messages: {
    'en-US': enUS,
    'zh-CN': zhCN,
  },
})

document.documentElement.lang = i18n.global.locale.value

export default i18n
