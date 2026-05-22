import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8).max(128),
  }),
})

export const loginSchema = z.object({
  body: z.object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(1),
  }),
})

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
  }),
})

export const updateProfileSchema = z.object({
  body: z.object({
    email: z.email().trim().toLowerCase().optional(),
    name: z.string().trim().min(2).max(80).optional(),
  }),
})
