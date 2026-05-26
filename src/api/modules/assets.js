import http from '../http'

export function getAssets(params) {
  return http.get('/assets', { params })
}

export function getAssetDetail(id) {
  return http.get(`/assets/${id}`)
}
