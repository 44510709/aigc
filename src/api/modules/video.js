import http from '../http'

export function getVideoList(params) {
  return http.get('/pc/video/list', { params })
}

export function createImageVideo(data) {
  return http.post('/pc/video/image-to-video', data)
}

export function createScriptVideo(data) {
  return http.post('/pc/video/script-to-video', data)
}

export function getGenerationHistory(params) {
  return http.get('/pc/video/history', { params })
}
