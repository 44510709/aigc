import http from '../http'

export function getImageList(params) {
  return http.get('/pc/image/list', { params })
}

export function createTextToImage(data) {
  return http.post('/pc/image/text-to-image', data)
}

export function getImageDetail(id) {
  return http.get(`/pc/image/${id}`)
}