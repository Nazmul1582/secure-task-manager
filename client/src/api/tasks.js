import { http, unwrap } from './http'

export const tasksApi = {
  list(params) {
    return http.get('/tasks', { params }).then(unwrap)
  },
  create(payload) {
    return http.post('/tasks', payload).then(unwrap)
  },
  get(id) {
    return http.get(`/tasks/${id}`).then(unwrap)
  },
  update(id, payload) {
    return http.patch(`/tasks/${id}`, payload).then(unwrap)
  },
  remove(id) {
    return http.delete(`/tasks/${id}`).then(unwrap)
  },
}

