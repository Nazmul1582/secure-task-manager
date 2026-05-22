import {
  changeUserPassword,
  loginUser,
  logoutAllSessions,
  logoutUser,
  registerUser,
  rotateRefreshSession,
  softDeleteUserAccount,
  updateUserProfile,
} from '../services/authService.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  getClearRefreshCookieOptions,
  getRefreshCookieOptions,
  REFRESH_TOKEN_COOKIE_NAME,
} from '../utils/tokens.js'
import { sendSuccess } from '../utils/apiResponse.js'

export const register = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await registerUser(req.validated.body, req)

  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, getRefreshCookieOptions())

  sendSuccess(res, {
    statusCode: 201,
    message: 'Registration successful',
    data: {
      user,
      accessToken,
    },
  })
})

export const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await loginUser(req.validated.body, req)

  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, getRefreshCookieOptions())

  sendSuccess(res, {
    message: 'Login successful',
    data: {
      user,
      accessToken,
    },
  })
})

export const refreshToken = asyncHandler(async (req, res) => {
  const currentRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME]
  const {
    accessToken,
    refreshToken: newRefreshToken,
    user,
  } = await rotateRefreshSession(currentRefreshToken, req)

  res.cookie(REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, getRefreshCookieOptions())

  sendSuccess(res, {
    message: 'Token refreshed',
    data: {
      user,
      accessToken,
    },
  })
})

export const logout = asyncHandler(async (req, res) => {
  const currentRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME]

  await logoutUser(currentRefreshToken)
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getClearRefreshCookieOptions())

  sendSuccess(res, {
    message: 'Logout successful',
  })
})

export const logoutAll = asyncHandler(async (req, res) => {
  await logoutAllSessions(req.user.id)
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getClearRefreshCookieOptions())

  sendSuccess(res, {
    message: 'Logged out from all devices',
  })
})

export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, {
    message: 'Current user loaded',
    data: {
      user: req.user.toJSON(),
    },
  })
})

export const changePassword = asyncHandler(async (req, res) => {
  const user = await changeUserPassword(req.user.id, req.validated.body)

  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getClearRefreshCookieOptions())

  sendSuccess(res, {
    message: 'Password changed successfully. Please sign in again.',
    data: {
      user,
    },
  })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateUserProfile(req.user.id, req.validated.body)

  sendSuccess(res, {
    message: 'Profile updated',
    data: {
      user,
    },
  })
})

export const deleteAccount = asyncHandler(async (req, res) => {
  await softDeleteUserAccount(req.user.id)
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getClearRefreshCookieOptions())

  sendSuccess(res, {
    message: 'Account deleted',
  })
})
