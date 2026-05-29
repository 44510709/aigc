import http from '../api/http'

const STORAGE_KEY = 'aigc_token'

export const userStore = {
  state: {
    token: localStorage.getItem(STORAGE_KEY) || '',
    user: null,
  },
  setToken(token) {
    this.state.token = token
    if (token) {
      localStorage.setItem(STORAGE_KEY, token)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  },
  setUser(user) {
    this.state.user = user
  },
  login(username, password) {
    return http.post('/pc/auth/login', { username, password }).then((res) => {
      if (res.code === 200 && res.data) {
        this.setToken(res.data.token)
        this.setUser(res.data.user)
        return res.data
      }
      return Promise.reject(new Error(res.msg || '登录失败'))
    })
  },
  logout() {
    this.setToken('')
    this.setUser(null)
  },
  isLoggedIn() {
    return !!this.state.token
  },
}

export default userStore