import { http, unwrap } from './http'

export const usersApi = {
  list() {
    return http.get('/users').then(unwrap)
  },
  updateRole(id, role) {
    return http.patch(`/users/${id}/role`, { role }).then(unwrap)
  },
}
