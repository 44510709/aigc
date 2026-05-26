import http from '../http'

export function createImageVideo(payload) {
  return http.post('/videos/image-to-video', payload)
}

export function createScriptVideo(payload) {
  return http.post('/videos/script-to-video', payload)
}

export function getGenerationHistory(params) {
  return http.get('/videos/history', { params })
}
