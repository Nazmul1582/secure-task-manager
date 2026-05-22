import axios from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { clearAccessToken, getAccessToken, setAccessToken } from './tokenManager'
import { http } from './http'

const defaultAdapter = http.defaults.adapter

function rejectedResponse(config, status, data) {
  const error = new Error(data.message)
  error.config = config
  error.response = {
    config,
    data,
    headers: {},
    status,
    statusText: status === 401 ? 'Unauthorized' : 'Error',
  }

  return Promise.reject(error)
}

function getAuthorization(headers) {
  return headers?.get?.('Authorization') || headers?.Authorization
}

describe('http auth retry interceptor', () => {
  afterEach(() => {
    clearAccessToken()
    http.defaults.adapter = defaultAdapter
    vi.restoreAllMocks()
  })

  it('preserves login 401 errors instead of replacing them with refresh-token errors', async () => {
    const refreshSpy = vi.spyOn(axios, 'post')

    http.defaults.adapter = (config) =>
      rejectedResponse(config, 401, {
        message: 'Invalid email or password',
      })

    await expect(
      http.post('/auth/login', { email: 'bad@example.com', password: 'wrong' }),
    ).rejects.toMatchObject({
      response: {
        data: {
          message: 'Invalid email or password',
        },
      },
    })
    expect(refreshSpy).not.toHaveBeenCalled()
  })

  it('refreshes and retries protected requests when an access token exists', async () => {
    let attempts = 0
    let retriedAuthorization
    const refreshSpy = vi.spyOn(axios, 'post').mockResolvedValue({
      data: {
        data: {
          accessToken: 'fresh-token',
        },
      },
    })

    setAccessToken('expired-token')
    http.defaults.adapter = async (config) => {
      attempts += 1

      if (attempts === 1) {
        return rejectedResponse(config, 401, {
          message: 'Access token is invalid or expired',
        })
      }

      retriedAuthorization = getAuthorization(config.headers)

      return {
        config,
        data: {
          data: {
            ok: true,
          },
          message: 'Loaded',
          success: true,
        },
        headers: {},
        status: 200,
        statusText: 'OK',
      }
    }

    const response = await http.get('/tasks')

    expect(response.data.data.ok).toBe(true)
    expect(refreshSpy).toHaveBeenCalledWith(expect.stringContaining('/auth/refresh-token'), null, {
      withCredentials: true,
    })
    expect(getAccessToken()).toBe('fresh-token')
    expect(retriedAuthorization).toBe('Bearer fresh-token')
    expect(attempts).toBe(2)
  })
})
