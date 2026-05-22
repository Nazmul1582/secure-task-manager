import { z } from 'zod'

import { USER_ROLES } from '../models/User.js'

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id'),
  }),
})

export const updateUserRoleSchema = z.object({
  params: userIdParamSchema.shape.params,
  body: z.object({
    role: z.enum(Object.values(USER_ROLES)),
  }),
})
