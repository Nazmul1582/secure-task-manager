import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { tasksApi } from '@/api/tasks'
import { useTaskStore } from '@/store/taskStore'
import { TasksPage } from './TasksPage'

vi.mock('@/api/tasks', () => ({
  tasksApi: {
    list: vi.fn(),
  },
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
  })

  afterEach(() => {
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
})
