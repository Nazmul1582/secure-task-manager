import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { usersApi } from '@/api/users'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'
import { AdminUsersPage } from './AdminUsersPage'
import { toast } from 'sonner'

vi.mock('@/api/users', () => ({
  usersApi: {
    list: vi.fn(),
    updateRole: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

const users = [
  {
    _id: 'admin-1',
    createdAt: '2026-05-20T00:00:00.000Z',
    email: 'admin@todo.com',
    name: 'Admin',
    role: 'admin',
  },
  {
    _id: 'member-1',
    createdAt: '2026-05-21T00:00:00.000Z',
    email: 'member@example.com',
    name: 'Member User',
    role: 'member',
  },
]

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    usersApi.list.mockResolvedValue({ data: { users } })
    usersApi.updateRole.mockResolvedValue({
      data: {
        user: {
          ...users[1],
          role: 'admin',
        },
      },
    })
    useAuthStore.setState({
      accessToken: 'token',
      error: null,
      status: 'authenticated',
      user: users[0],
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

  it('renders users and updates a member role', async () => {
    render(<AdminUsersPage />)

    expect(await screen.findByText('member@example.com')).toBeInTheDocument()
    expect(screen.getByText('admin@todo.com')).toBeInTheDocument()

    const roleSelects = screen.getAllByRole('combobox')
    fireEvent.change(roleSelects[1], { target: { value: 'admin' } })

    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: /save/i })[1])
    })

    expect(usersApi.updateRole).toHaveBeenCalledWith('member-1', 'admin')
    expect(toast.success).toHaveBeenCalledWith('User role updated')
  })
})
