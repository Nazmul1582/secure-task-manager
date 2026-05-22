import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clearAccessToken } from '@/api/tokenManager'
import { I18nProvider } from '@/lib/i18n'
import { useAuthStore } from '@/store/authStore'
import { SettingsPage } from './SettingsPage'

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    error: vi.fn(),
    success: vi.fn(),
  }),
}))

function renderSettings() {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <SettingsPage />
      </I18nProvider>
    </MemoryRouter>,
  )
}

describe('SettingsPage', () => {
  const actions = {
    changePassword: vi.fn(),
    deleteAccount: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
  }

  beforeEach(() => {
    clearAccessToken()
    localStorage.removeItem('secureTaskManager.language')
    vi.clearAllMocks()
    useAuthStore.setState({
      ...actions,
      accessToken: 'token',
      error: null,
      status: 'authenticated',
      user: {
        email: 'member@example.com',
        name: 'Member User',
      },
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('renders profile, system, and account sections', () => {
    renderSettings()

    expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /system/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /account/i })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Member User')).toBeInTheDocument()
    expect(screen.getByText(/notification/i)).toBeInTheDocument()
    expect(screen.getByText(/language/i)).toBeInTheDocument()
  })

  it('submits profile updates', () => {
    renderSettings()

    fireEvent.change(screen.getByPlaceholderText(/your name/i), {
      target: {
        value: 'Updated Member',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }))

    expect(actions.updateProfile).toHaveBeenCalledWith({
      email: 'member@example.com',
      name: 'Updated Member',
    })
  })

  it('opens the delete account confirmation modal', () => {
    renderSettings()

    fireEvent.click(screen.getByRole('button', { name: /delete my account/i }))

    expect(screen.getByRole('heading', { name: /delete account/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^delete account$/i })).toBeInTheDocument()
  })

  it('switches settings labels to Bangla', () => {
    renderSettings()

    fireEvent.change(screen.getByDisplayValue('English'), {
      target: {
        value: 'bn',
      },
    })

    expect(screen.getByRole('heading', { name: 'সেটিংস' })).toBeInTheDocument()
    expect(screen.getByText('প্রোফাইল')).toBeInTheDocument()
  })
})
