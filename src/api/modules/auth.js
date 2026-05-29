import http from '../http'

export function login(username, password) {
  return http.post('/pc/auth/login', { username, password })
}

export function register(data) {
  return http.post('/pc/auth/register', data)
}