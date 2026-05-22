import { Router } from 'express'

import { listUsers, updateUserRole } from '../controllers/userController.js'
import { authenticate, authorizeRoles } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { USER_ROLES } from '../models/User.js'
import { updateUserRoleSchema } from '../validators/userValidators.js'

const router = Router()

router.use(authenticate, authorizeRoles(USER_ROLES.ADMIN))

router.get('/', listUsers)
router.patch('/:id/role', validate(updateUserRoleSchema), updateUserRole)

export default router
