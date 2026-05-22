import { create } from 'zustand'

import { usersApi } from '@/api/users'

export const useUserStore = create((set, get) => ({
  error: null,
  status: 'idle',
  users: [],

  async fetchUsers() {
    set({ error: null, status: 'loading' })

    try {
      const response = await usersApi.list()
      set({
        error: null,
        status: 'success',
        users: response.data.users,
      })
      return response.data.users
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Unable to load users',
        status: 'error',
      })
      throw error
    }
  },

  async updateUserRole(id, role) {
    set({ error: null })

    try {
      const response = await usersApi.updateRole(id, role)
      set({
        error: null,
        users: get().users.map((user) => (user._id === id ? response.data.user : user)),
      })
      return response.data.user
    } catch (error) {
      set({ error: error.response?.data?.message || 'Unable to update user role' })
      throw error
    }
  },
}))
