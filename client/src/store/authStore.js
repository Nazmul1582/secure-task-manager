import { create } from 'zustand'

import { authApi } from '@/api/auth'
import { clearAccessToken, onAccessTokenChange, setAccessToken } from '@/api/tokenManager'

const initialState = {
  user: null,
  accessToken: null,
  status: 'idle',
  error: null,
}

let refreshSessionPromise = null

export const useAuthStore = create((set, get) => ({
  ...initialState,

  isAuthenticated: () => Boolean(get().user && get().accessToken),

  setSession(session) {
    setAccessToken(session.accessToken)
    set({
      user: session.user,
      accessToken: session.accessToken,
      status: 'authenticated',
      error: null,
    })
  },

  clearSession() {
    clearAccessToken()
    set({
      user: null,
      accessToken: null,
      status: 'unauthenticated',
      error: null,
    })
  },

  async register(payload) {
    set({ status: 'loading', error: null })

    try {
      const response = await authApi.register(payload)
      get().setSession(response.data)
      return response.data
    } catch (error) {
      set({ status: 'unauthenticated', error: getErrorMessage(error) })
      throw error
    }
  },

  async login(payload) {
    set({ status: 'loading', error: null })

    try {
      const response = await authApi.login(payload)
      get().setSession(response.data)
      return response.data
    } catch (error) {
      set({ status: 'unauthenticated', error: getErrorMessage(error) })
      throw error
    }
  },

  async refresh() {
    if (refreshSessionPromise) {
      return refreshSessionPromise
    }

    set({ status: 'loading', error: null })

    refreshSessionPromise = authApi
      .refreshToken()
      .then((response) => {
        get().setSession(response.data)
        return response.data
      })
      .catch(() => {
        get().clearSession()
        return null
      })
      .finally(() => {
        refreshSessionPromise = null
      })

    return refreshSessionPromise
  },

  async loadMe() {
    try {
      const response = await authApi.me()
      set({ user: response.data.user, status: 'authenticated', error: null })
      return response.data.user
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    }
  },

  async logout() {
    try {
      await authApi.logout()
    } finally {
      get().clearSession()
    }
  },

  async logoutAll() {
    try {
      await authApi.logoutAll()
    } finally {
      get().clearSession()
    }
  },

  async changePassword(payload) {
    set({ error: null })

    try {
      const response = await authApi.changePassword(payload)
      get().clearSession()
      return response.data
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    }
  },

  async updateProfile(payload) {
    set({ error: null })

    try {
      const response = await authApi.updateProfile(payload)
      set({ user: response.data.user, error: null })
      return response.data.user
    } catch (error) {
      set({ error: getErrorMessage(error) })
      throw error
    }
  },

  async deleteAccount() {
    try {
      await authApi.deleteAccount()
    } finally {
      get().clearSession()
    }
  },
}))

onAccessTokenChange((token) => {
  useAuthStore.setState({ accessToken: token })
})

function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Something went wrong'
}
