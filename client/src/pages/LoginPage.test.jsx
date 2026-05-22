import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { LoginPage } from './LoginPage'
import { clearAccessToken } from '@/api/tokenManager'
import { useAuthStore } from '@/store/authStore'

describe('LoginPage', () => {
  beforeEach(() => {
    clearAccessToken()
    useAuthStore.setState({
      user: null,
      accessToken: null,
      status: 'unauthenticated',
      error: null,
    })
  })

  it('validates required login fields', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
  })
})
