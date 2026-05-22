import { beforeEach, describe, expect, it, vi } from 'vitest'

import { tasksApi } from '@/api/tasks'
import { useTaskStore } from './taskStore'

vi.mock('@/api/tasks', () => ({
  tasksApi: {
    remove: vi.fn(),
  },
}))

describe('taskStore board actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useTaskStore.setState({
      currentTask: null,
      error: null,
      filters: {
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      meta: {
        limit: 20,
        page: 1,
        total: 3,
        totalPages: 1,
      },
      status: 'idle',
      tasks: [
        { _id: 'task-1', position: 1000, status: 'todo', title: 'First' },
        { _id: 'task-2', position: 2000, status: 'todo', title: 'Second' },
        { _id: 'task-3', position: 3000, status: 'done', title: 'Third' },
      ],
    })
  })

  it('reorders tasks within the same status column', () => {
    useTaskStore.getState().reorderTasks('task-2', 'task-1', 'todo', 500)

    expect(useTaskStore.getState().tasks.map((task) => task._id)).toEqual(['task-2', 'task-1', 'task-3'])
    expect(useTaskStore.getState().tasks[0].position).toBe(500)
  })

  it('deletes a task through the API and removes it locally', async () => {
    tasksApi.remove.mockResolvedValue({})

    await useTaskStore.getState().removeTask('task-1')

    expect(tasksApi.remove).toHaveBeenCalledWith('task-1')
    expect(useTaskStore.getState().tasks.map((task) => task._id)).toEqual(['task-2', 'task-3'])
    expect(useTaskStore.getState().meta.total).toBe(2)
  })
})
