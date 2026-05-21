import { http, unwrap } from './http'

export const authApi = {
  register(payload) {
    return http.post('/auth/register', payload).then(unwrap)
  },
  login(payload) {
    return http.post('/auth/login', payload).then(unwrap)
  },
  refreshToken() {
    return http.post('/auth/refresh-token').then(unwrap)
  },
  logout() {
    return http.post('/auth/logout').then(unwrap)
  },
  logoutAll() {
    return http.post('/auth/logout-all').then(unwrap)
  },
  me() {
    return http.get('/auth/me').then(unwrap)
  },
  changePassword(payload) {
    return http.post('/auth/change-password', payload).then(unwrap)
  },
}

