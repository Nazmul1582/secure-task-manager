import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '@/store/authStore'
import { AdminRoute } from './AdminRoute'

describe('AdminRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: 'token',
      error: null,
      status: 'authenticated',
      user: {
        _id: 'member-1',
        email: 'member@example.com',
        name: 'Member User',
        role: 'member',
      },
    })
  })

  it('redirects non-admin users to the dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/admin/users']}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/admin/users" element={<div>Admin users</div>} />
          </Route>
          <Route path="/" element={<div>Dashboard route</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Dashboard route')).toBeInTheDocument()
    expect(screen.queryByText('Admin users')).not.toBeInTheDocument()
  })
})
