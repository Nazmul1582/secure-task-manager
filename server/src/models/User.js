import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

export const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
}

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    _id: true,
    timestamps: true,
  },
)

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name must be 80 characters or less'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, 'Email must be 254 characters or less'],
      match: [/^\S+@\S+\.\S+$/, 'Email is invalid'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.MEMBER,
    },
    avatar: {
      type: String,
      default: '',
      trim: true,
    },
    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password
        delete ret.refreshTokens
        delete ret.__v
        return ret
      },
    },
  },
)

userSchema.index({ role: 1 })

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next()
  }

  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  return next()
})

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

export const User = mongoose.model('User', userSchema)
