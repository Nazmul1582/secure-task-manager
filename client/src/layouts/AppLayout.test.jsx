import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/store/authStore'
import { AppLayout } from './AppLayout'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}))

function renderLayout(user) {
  useAuthStore.setState({
    accessToken: 'token',
    error: null,
    status: 'authenticated',
    user,
  })

  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<div>Dashboard content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AppLayout', () => {
  beforeEach(() => {
    useAuthStore.setState({ logout: vi.fn() })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('shows admin navigation only for admins', () => {
    renderLayout({
      _id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    })

    expect(screen.getByRole('link', { name: /users/i })).toBeInTheDocument()

    cleanup()

    renderLayout({
      _id: 'member-1',
      email: 'member@example.com',
      name: 'Member User',
      role: 'member',
    })

    expect(screen.queryByRole('link', { name: /users/i })).not.toBeInTheDocument()
  })
})
