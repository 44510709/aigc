import http from '../http'

export function getImageList(params) {
  return http.get('/pc/video/list', { params })
}

export function createTextToImage(data) {
  return http.post('/pc/image/generate', data)
}

export function getImageDetail(id) {
  return http.get(`/pc/video/${id}`)
}