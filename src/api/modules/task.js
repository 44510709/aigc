import http from '../http'

export function getTaskList(params) {
  return http.get('/pc/task/list', { params })
}

export function getTaskDetail(id) {
  return http.get(`/pc/task/detail/${id}`)
}

export function createTask(data) {
  return http.post('/pc/task/create', data)
}

export function updateTask(data) {
  return http.post('/pc/task/update', data)
}

export function deleteTask(id) {
  return http.post(`/pc/task/delete/${id}`)
}

export function topTask(id) {
  return http.post(`/pc/task/top/${id}`)
}

export function cancelTopTask(id) {
  return http.post(`/pc/task/cancelTop/${id}`)
}

export function onShelfTask(id) {
  return http.post(`/pc/task/onShelf/${id}`)
}

export function offShelfTask(id) {
  return http.post(`/pc/task/offShelf/${id}`)
}