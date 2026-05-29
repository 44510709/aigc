import axios from 'axios'
import i18n from '../i18n'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('aigc_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  // 如果是 FormData，不设置 Content-Type，让浏览器自动生成带 boundary 的值
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  config.headers['Accept-Language'] = i18n.global.locale.value
  return config
})

http.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
)

export default http
