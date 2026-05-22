import { beforeEach, describe, expect, it, vi } from 'vitest'

import { clearAccessToken, getAccessToken } from '@/api/tokenManager'
import { authApi } from '@/api/auth'
import { useAuthStore } from './authStore'

vi.mock('@/api/auth', () => ({
  authApi: {
    refreshToken: vi.fn(),
  },
}))

describe('authStore refresh', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      accessToken: null,
      status: 'idle',
      error: null,
    })
  })

  it('shares an in-flight refresh request so reloads do not rotate the same token twice', async () => {
    const session = {
      accessToken: 'fresh-token',
      user: {
        email: 'member@example.com',
        name: 'Member User',
      },
    }
    authApi.refreshToken.mockResolvedValue({
      data: session,
    })

    const [firstResult, secondResult] = await Promise.all([
      useAuthStore.getState().refresh(),
      useAuthStore.getState().refresh(),
    ])

    expect(authApi.refreshToken).toHaveBeenCalledTimes(1)
    expect(firstResult).toEqual(session)
    expect(secondResult).toEqual(session)
    expect(getAccessToken()).toBe('fresh-token')
    expect(useAuthStore.getState().status).toBe('authenticated')
  })
})
