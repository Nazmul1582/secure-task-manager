import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { tasksApi } from '@/api/tasks'
import { usersApi } from '@/api/users'
import { useAuthStore } from '@/store/authStore'
import { useTaskStore } from '@/store/taskStore'
import { useUserStore } from '@/store/userStore'
import { DashboardPage } from './DashboardPage'

vi.mock('@/api/tasks', () => ({
  tasksApi: {
    list: vi.fn(),
  },
}))

vi.mock('@/api/users', () => ({
  usersApi: {
    list: vi.fn(),
  },
}))

vi.mock('recharts', () => ({
  Area: () => null,
  AreaChart: ({ children }) => <div>{children}</div>,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    tasksApi.list.mockResolvedValue({
      data: {
        tasks: [],
      },
      meta: {
        limit: 100,
        page: 1,
        total: 0,
        totalPages: 1,
      },
    })
    usersApi.list.mockResolvedValue({
      data: {
        users: [
          { _id: 'admin-1', role: 'admin' },
          { _id: 'member-1', role: 'member' },
        ],
      },
    })
    useTaskStore.setState({
      error: null,
      status: 'idle',
      tasks: [],
    })
    useUserStore.setState({
      error: null,
      status: 'idle',
      users: [],
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('shows admin summary only for admins', async () => {
    useAuthStore.setState({
      accessToken: 'token',
      status: 'authenticated',
      user: {
        _id: 'admin-1',
        role: 'admin',
      },
    })

    render(<DashboardPage />)

    expect(await screen.findByText(/admin overview/i)).toBeInTheDocument()
    expect(usersApi.list).toHaveBeenCalled()

    cleanup()
    vi.clearAllMocks()
    useUserStore.setState({
      error: null,
      status: 'idle',
      users: [],
    })
    useAuthStore.setState({
      accessToken: 'token',
      status: 'authenticated',
      user: {
        _id: 'member-1',
        role: 'member',
      },
    })

    render(<DashboardPage />)

    expect(screen.queryByText(/admin overview/i)).not.toBeInTheDocument()
    expect(usersApi.list).not.toHaveBeenCalled()
  })
})
