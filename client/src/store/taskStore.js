import { create } from 'zustand'

import { tasksApi } from '@/api/tasks'

const defaultFilters = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
}

export const useTaskStore = create((set, get) => ({
  tasks: [],
  meta: null,
  filters: defaultFilters,
  status: 'idle',
  error: null,

  async fetchTasks(params = {}) {
    const filters = {
      ...get().filters,
      ...params,
    }

    set({ status: 'loading', error: null, filters })

    try {
      const response = await tasksApi.list(cleanParams(filters))
      set({
        tasks: response.data.tasks,
        meta: response.meta,
        status: 'success',
        error: null,
      })
      return response.data.tasks
    } catch (error) {
      set({
        status: 'error',
        error: error.response?.data?.message || 'Unable to load tasks',
      })
      return []
    }
  },
}))

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === '' || value === null || value === undefined) {
        return false
      }

      if (Array.isArray(value) && value.length === 0) {
        return false
      }

      return true
    }),
  )
}
