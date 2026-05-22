import { listUsersForAdmin, updateUserRoleForAdmin } from '../services/userService.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/apiResponse.js'

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await listUsersForAdmin()

  sendSuccess(res, {
    message: 'Users loaded',
    data: {
      users,
    },
  })
})

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await updateUserRoleForAdmin(req.validated.params.id, req.validated.body.role)

  sendSuccess(res, {
    message: 'User role updated',
    data: {
      user,
    },
  })
})
