import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { clearAccessToken } from '@/api/tokenManager'
import { useAuthStore } from '@/store/authStore'
import { ProtectedRoute } from './ProtectedRoute'

describe('ProtectedRoute', () => {
  beforeEach(() => {
    clearAccessToken()
    useAuthStore.setState({
      user: null,
      accessToken: null,
      status: 'unauthenticated',
      error: null,
    })
  })

  it('redirects anonymous users to login', () => {
    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/tasks" element={<div>Private tasks</div>} />
          </Route>
          <Route path="/login" element={<div>Login route</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Login route')).toBeInTheDocument()
    expect(screen.queryByText('Private tasks')).not.toBeInTheDocument()
  })
})
