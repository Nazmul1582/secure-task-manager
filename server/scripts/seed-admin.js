import { fileURLToPath } from 'node:url'

import { connectDatabase, disconnectDatabase } from '../src/config/database.js'
import { USER_ROLES, User } from '../src/models/User.js'

export async function seedAdmin({
  UserModel = User,
  email = process.env.ADMIN_EMAIL,
  name = process.env.ADMIN_NAME || 'Admin',
  password = process.env.ADMIN_PASSWORD,
} = {}) {
  const normalizedEmail = email?.trim().toLowerCase()

  if (!normalizedEmail) {
    throw new Error('ADMIN_EMAIL is required')
  }

  const existingUser = await UserModel.findOne({ email: normalizedEmail }).select('+password +refreshTokens')

  if (existingUser) {
    existingUser.name ||= name
    existingUser.role = USER_ROLES.ADMIN
    existingUser.deletedAt = null
    existingUser.refreshTokens = []
    await existingUser.save({ validateBeforeSave: false })

    return {
      action: 'promoted',
      user: existingUser.toJSON(),
    }
  }

  if (!password) {
    throw new Error('ADMIN_PASSWORD is required when creating a new admin')
  }

  const user = await UserModel.create({
    email: normalizedEmail,
    name,
    password,
    role: USER_ROLES.ADMIN,
  })

  return {
    action: 'created',
    user: user.toJSON(),
  }
}

async function main() {
  await connectDatabase()

  try {
    const result = await seedAdmin()
    console.log(`Admin ${result.action}: ${result.user.email}`)
  } finally {
    await disconnectDatabase()
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
