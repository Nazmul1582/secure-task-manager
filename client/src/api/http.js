import axios from 'axios'

import { clearAccessToken, getAccessToken, setAccessToken } from './tokenManager'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise = null

http.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh-token')

    if (status !== 401 || !originalRequest || originalRequest._retry || isRefreshRequest) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      refreshPromise ??= axios
        .post(`${API_URL}/auth/refresh-token`, null, { withCredentials: true })
        .then((response) => response.data.data)
        .finally(() => {
          refreshPromise = null
        })

      const session = await refreshPromise
      setAccessToken(session.accessToken)
      originalRequest.headers.Authorization = `Bearer ${session.accessToken}`

      return http(originalRequest)
    } catch (refreshError) {
      clearAccessToken()
      return Promise.reject(refreshError)
    }
  },
)

export function unwrap(response) {
  return {
    data: response.data.data,
    meta: response.data.meta,
    message: response.data.message,
  }
}

