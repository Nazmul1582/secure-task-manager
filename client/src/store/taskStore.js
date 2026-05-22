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
  currentTask: null,
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

  async getTask(id) {
    set({ status: 'loading', error: null })

    try {
      const response = await tasksApi.get(id)
      set({ currentTask: response.data.task, status: 'success', error: null })
      return response.data.task
    } catch (error) {
      set({
        status: 'error',
        error: error.response?.data?.message || 'Unable to load task',
      })
      throw error
    }
  },

  async createTask(payload) {
    set({ status: 'loading', error: null })

    try {
      const response = await tasksApi.create(payload)
      set((state) => ({
        tasks: [response.data.task, ...state.tasks],
        currentTask: response.data.task,
        status: 'success',
        error: null,
      }))
      return response.data.task
    } catch (error) {
      set({
        status: 'error',
        error: error.response?.data?.message || 'Unable to create task',
      })
      throw error
    }
  },

  async updateTask(id, payload) {
    set({ status: 'loading', error: null })

    try {
      const response = await tasksApi.update(id, payload)
      set((state) => ({
        tasks: state.tasks.map((task) => (task._id === id ? response.data.task : task)),
        currentTask: response.data.task,
        status: 'success',
        error: null,
      }))
      return response.data.task
    } catch (error) {
      set({
        status: 'error',
        error: error.response?.data?.message || 'Unable to update task',
      })
      throw error
    }
  },

  reorderTasks(activeId, overId, nextStatus, nextPosition) {
    set((state) => {
      const activeIndex = state.tasks.findIndex((task) => task._id === activeId)

      if (activeIndex === -1) {
        return state
      }

      const activeTask = {
        ...state.tasks[activeIndex],
        position: nextPosition ?? state.tasks[activeIndex].position,
        status: nextStatus || state.tasks[activeIndex].status,
      }
      const nextTasks = state.tasks.filter((task) => task._id !== activeId)
      const overIndex = nextTasks.findIndex((task) => task._id === overId)

      if (overIndex === -1) {
        nextTasks.unshift(activeTask)
      } else {
        nextTasks.splice(overIndex, 0, activeTask)
      }

      return {
        tasks: nextTasks,
      }
    })
  },

  async removeTask(id) {
    set({ status: 'loading', error: null })

    try {
      await tasksApi.remove(id)
      set((state) => ({
        tasks: state.tasks.filter((task) => task._id !== id),
        currentTask: state.currentTask?._id === id ? null : state.currentTask,
        meta: state.meta
          ? {
              ...state.meta,
              total: Math.max(state.meta.total - 1, 0),
            }
          : state.meta,
        status: 'success',
        error: null,
      }))
    } catch (error) {
      set({
        status: 'error',
        error: error.response?.data?.message || 'Unable to delete task',
      })
      throw error
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
