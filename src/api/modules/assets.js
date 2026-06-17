import http from '../http'

export function getMediaList(params) {
  return http.get('/pc/media/list', { params })
}

export function createMedia(data) {
  return http.post('/pc/media/create', data)
}

export function deleteMedia(id) {
  return http.post(`/pc/media/delete/${id}`)
}

export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file, file.name || 'upload')
  return http.post('/common/file/upload', formData)
}

export function getAssets(params) {
  return http.get('/assets', { params })
}

export function getAssetDetail(id) {
  return http.get(`/assets/${id}`)
}
