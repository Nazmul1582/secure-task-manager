import { USER_ROLES, User } from '../models/User.js'
import { ApiError } from '../utils/apiError.js'

export async function listUsersForAdmin() {
  return User.find({ deletedAt: null })
    .select('name email avatar role createdAt updatedAt')
    .sort({ createdAt: -1 })
    .lean()
}

export async function updateUserRoleForAdmin(userId, role) {
  const user = await User.findOne({ _id: userId, deletedAt: null })

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  user.role = role || USER_ROLES.MEMBER
  await user.save({ validateBeforeSave: false })

  return user.toJSON()
}
