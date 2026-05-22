import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { tasksApi } from '@/api/tasks'
import { useAuthStore } from '@/store/authStore'
import { useTaskStore } from '@/store/taskStore'
import { TasksPage } from './TasksPage'
import { toast } from 'sonner'

vi.mock('@/api/tasks', () => ({
  tasksApi: {
    list: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    error: vi.fn(),
    success: vi.fn(),
  }),
}))

describe('TasksPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    tasksApi.list.mockResolvedValue({
      data: {
        tasks: [],
      },
      meta: {
        limit: 10,
        page: 1,
        total: 0,
        totalPages: 1,
      },
    })
    tasksApi.remove.mockResolvedValue({})
    useTaskStore.setState({
      currentTask: null,
      error: null,
      filters: {
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
      meta: null,
      status: 'idle',
      tasks: [],
    })
    useAuthStore.setState({
      accessToken: 'token',
      status: 'authenticated',
      user: {
        _id: 'member-1',
        role: 'member',
      },
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('debounces search input before fetching filtered tasks', async () => {
    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>,
    )

    expect(tasksApi.list).toHaveBeenCalledTimes(1)

    fireEvent.change(screen.getByPlaceholderText(/search tasks/i), {
      target: {
        value: 'complete',
      },
    })

    act(() => {
      vi.advanceTimersByTime(399)
    })
    expect(tasksApi.list).toHaveBeenCalledTimes(1)

    await act(async () => {
      vi.advanceTimersByTime(1)
    })

    expect(tasksApi.list).toHaveBeenCalledTimes(2)
    expect(tasksApi.list).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page: 1,
        search: 'complete',
      }),
    )
  })

  it('shows a confirmation toast before deleting a task', async () => {
    vi.useRealTimers()
    tasksApi.list.mockResolvedValue({
      data: {
        tasks: [
          {
            _id: 'task-1',
            assignedTo: {
              name: 'Member User',
            },
            createdBy: {
              name: 'Admin User',
            },
            description: 'A task that can be deleted',
            priority: 'high',
            status: 'todo',
            title: 'Delete me',
          },
        ],
      },
      meta: {
        limit: 10,
        page: 1,
        total: 1,
        totalPages: 1,
      },
    })

    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>,
    )

    fireEvent.click(await screen.findByRole('button', { name: /delete delete me/i }))

    expect(toast).toHaveBeenCalledWith(
      'Delete task?',
      expect.objectContaining({
        action: expect.objectContaining({
          label: 'Delete',
        }),
      }),
    )

    await act(async () => {
      await toast.mock.calls[0][1].action.onClick()
    })

    expect(tasksApi.remove).toHaveBeenCalledWith('task-1')
    expect(toast.success).toHaveBeenCalledWith('Task deleted')
  })

  it('shows created and assigned user badges for admins', async () => {
    vi.useRealTimers()
    useAuthStore.setState({
      accessToken: 'token',
      status: 'authenticated',
      user: {
        _id: 'admin-1',
        role: 'admin',
      },
    })
    tasksApi.list.mockResolvedValue({
      data: {
        tasks: [
          {
            _id: 'task-1',
            assignedTo: {
              name: 'Member User',
            },
            createdBy: {
              name: 'Admin User',
            },
            priority: 'high',
            status: 'todo',
            title: 'Owned task',
          },
        ],
      },
      meta: {
        limit: 10,
        page: 1,
        total: 1,
        totalPages: 1,
      },
    })

    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Owned task')).toBeInTheDocument()
    expect(screen.getByText(/created by/i)).toBeInTheDocument()
    expect(screen.getByText(/admin user/i)).toBeInTheDocument()
    expect(screen.getByText(/assigned to/i)).toBeInTheDocument()
    expect(screen.getByText(/member user/i)).toBeInTheDocument()
  })
})
