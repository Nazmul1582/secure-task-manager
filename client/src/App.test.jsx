import { act, cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from './App'
import { clearAccessToken } from '@/api/tokenManager'
import { ThemeProvider } from '@/components/theme-provider'
import { useAuthStore } from '@/store/authStore'

const originalActions = {
  clearSession: useAuthStore.getState().clearSession,
  refresh: useAuthStore.getState().refresh,
}

function renderApp(path) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('App session bootstrap', () => {
  beforeEach(() => {
    clearAccessToken()
    useAuthStore.setState({
      ...originalActions,
      user: null,
      accessToken: null,
      status: 'idle',
      error: null,
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    useAuthStore.setState(originalActions)
  })

  it('does not call refresh token when opening the login page', async () => {
    const refresh = vi.fn()
    useAuthStore.setState({ refresh })

    renderApp('/login')

    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    expect(refresh).not.toHaveBeenCalled()
  })

  it('does not call refresh token when opening the register page', async () => {
    const refresh = vi.fn()
    useAuthStore.setState({ refresh })

    renderApp('/register')

    expect(await screen.findByRole('heading', { name: /create account/i })).toBeInTheDocument()
    expect(refresh).not.toHaveBeenCalled()
  })

  it('waits for refresh before rendering a protected route after a page reload', async () => {
    let resolveRefresh
    const refreshComplete = new Promise((resolve) => {
      resolveRefresh = resolve
    })
    const session = {
      accessToken: 'fresh-token',
      user: {
        email: 'member@example.com',
        name: 'Member User',
      },
    }
    const refresh = vi.fn(async () => {
      await refreshComplete
      useAuthStore.getState().setSession(session)
      return session
    })
    useAuthStore.setState({ refresh })

    renderApp('/settings')

    expect(screen.queryByRole('heading', { name: /settings/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /sign in/i })).not.toBeInTheDocument()

    await act(async () => {
      resolveRefresh()
      await refreshComplete
    })

    expect(await screen.findByRole('heading', { name: /settings/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /sign in/i })).not.toBeInTheDocument()
    expect(refresh).toHaveBeenCalledTimes(1)
  })
})
