import { User } from '../models/User.js'
import { ApiError } from '../utils/apiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { verifyAccessToken } from '../utils/tokens.js'

export const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.get('authorization') || ''
  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Access token is required')
  }

  let payload

  try {
    payload = verifyAccessToken(token)
  } catch {
    throw new ApiError(401, 'Access token is invalid or expired')
  }

  const user = await User.findById(payload.sub)

  if (!user) {
    throw new ApiError(401, 'Access token user no longer exists')
  }

  req.user = user
  next()
})

export function authorizeRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to access this resource'))
    }

    return next()
  }
}
