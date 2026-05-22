import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { clearAccessToken } from '@/api/tokenManager'
import { useAuthStore } from '@/store/authStore'
import { RegisterPage } from './RegisterPage'

describe('RegisterPage', () => {
  beforeEach(() => {
    clearAccessToken()
    useAuthStore.setState({
      user: null,
      accessToken: null,
      status: 'unauthenticated',
      error: null,
    })
  })

  it('renders placeholders and validates required registration fields', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    expect(screen.getByPlaceholderText(/md\. nazmul hasan/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/create an 8\+ character password/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/confirm your password/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText(/name must be at least 2 characters/i)).toBeInTheDocument()
    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument()
    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    expect(screen.getByText(/confirm your password/i)).toBeInTheDocument()
  })
})
