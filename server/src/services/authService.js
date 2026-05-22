import { env } from '../config/env.js'
import { USER_ROLES, User } from '../models/User.js'
import { ApiError } from '../utils/apiError.js'
import {
  expiresInToDate,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/tokens.js'

export async function registerUser(input, req) {
  const email = input.email.toLowerCase()
  const existingUser = await User.exists({ email })

  if (existingUser) {
    throw new ApiError(409, 'A user with this email already exists')
  }

  const user = new User({
    name: input.name,
    email,
    password: input.password,
    role: env.ADMIN_EMAILS.includes(email) ? USER_ROLES.ADMIN : USER_ROLES.MEMBER,
  })

  await user.save()

  return createAuthSession(user, req)
}

export async function loginUser(input, req) {
  const email = input.email.toLowerCase()
  const user = await User.findOne({ email, deletedAt: null }).select('+password +refreshTokens')

  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const passwordMatches = await user.comparePassword(input.password)

  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password')
  }

  return createAuthSession(user, req)
}

export async function createAuthSession(user, req) {
  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)

  await saveRefreshSession(user, refreshToken, req)

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  }
}

export async function rotateRefreshSession(refreshToken, req) {
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is required')
  }

  let payload

  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw new ApiError(401, 'Refresh token is invalid or expired')
  }

  const user = await User.findOne({ _id: payload.sub, deletedAt: null }).select('+refreshTokens')

  if (!user) {
    throw new ApiError(401, 'Refresh token is invalid or expired')
  }

  const now = new Date()
  const currentTokenHash = hashToken(refreshToken)
  const currentSession = user.refreshTokens.find(
    (session) => session.tokenHash === currentTokenHash && session.expiresAt > now,
  )

  if (!currentSession) {
    user.refreshTokens = []
    await user.save({ validateBeforeSave: false })
    throw new ApiError(401, 'Refresh token reuse detected. Please sign in again.')
  }

  user.refreshTokens = user.refreshTokens.filter(
    (session) => session.tokenHash !== currentTokenHash && session.expiresAt > now,
  )

  const accessToken = signAccessToken(user)
  const newRefreshToken = signRefreshToken(user)

  await saveRefreshSession(user, newRefreshToken, req)

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken: newRefreshToken,
  }
}

export async function logoutUser(refreshToken) {
  if (!refreshToken) {
    return
  }

  let payload

  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    return
  }

  const user = await User.findOne({ _id: payload.sub, deletedAt: null }).select('+refreshTokens')

  if (!user) {
    return
  }

  const tokenHash = hashToken(refreshToken)
  user.refreshTokens = user.refreshTokens.filter((session) => session.tokenHash !== tokenHash)
  await user.save({ validateBeforeSave: false })
}

export async function logoutAllSessions(userId) {
  const user = await User.findOne({ _id: userId, deletedAt: null }).select('+refreshTokens')

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  user.refreshTokens = []
  await user.save({ validateBeforeSave: false })
}

export async function changeUserPassword(userId, input) {
  const user = await User.findOne({ _id: userId, deletedAt: null }).select('+password +refreshTokens')

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const passwordMatches = await user.comparePassword(input.currentPassword)

  if (!passwordMatches) {
    throw new ApiError(400, 'Current password is incorrect')
  }

  if (input.currentPassword === input.newPassword) {
    throw new ApiError(400, 'New password must be different from the current password')
  }

  user.password = input.newPassword
  user.refreshTokens = []
  await user.save()

  return user.toJSON()
}

export async function updateUserProfile(userId, input) {
  const user = await User.findOne({ _id: userId, deletedAt: null })

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  if (input.email && input.email !== user.email) {
    const existingUser = await User.exists({ email: input.email })

    if (existingUser) {
      throw new ApiError(409, 'A user with this email already exists')
    }

    user.email = input.email
  }

  if (input.name) {
    user.name = input.name
  }

  await user.save({ validateBeforeSave: false })

  return user.toJSON()
}

export async function softDeleteUserAccount(userId) {
  const user = await User.findOne({ _id: userId, deletedAt: null }).select('+refreshTokens')

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  user.deletedAt = new Date()
  user.refreshTokens = []
  await user.save({ validateBeforeSave: false })

  return user.toJSON()
}

async function saveRefreshSession(user, refreshToken, req) {
  const now = new Date()

  user.refreshTokens = user.refreshTokens.filter((session) => session.expiresAt > now)
  user.refreshTokens.push({
    tokenHash: hashToken(refreshToken),
    userAgent: req.get('user-agent') || '',
    ipAddress: req.ip || '',
    expiresAt: expiresInToDate(),
  })

  await user.save({ validateBeforeSave: false })
}
