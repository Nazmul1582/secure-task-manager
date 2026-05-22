import { Router } from 'express'

import {
  changePassword,
  deleteAccount,
  getMe,
  login,
  logout,
  logoutAll,
  refreshToken,
  register,
  updateProfile,
} from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from '../validators/authValidators.js'

const router = Router()

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.post('/refresh-token', refreshToken)
router.post('/logout', logout)
router.post('/logout-all', authenticate, logoutAll)
router.get('/me', authenticate, getMe)
router.patch('/profile', authenticate, validate(updateProfileSchema), updateProfile)
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword)
router.delete('/account', authenticate, deleteAccount)

export default router
