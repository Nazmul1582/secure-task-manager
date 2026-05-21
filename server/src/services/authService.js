import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { expiresInToDate, hashToken, signAccessToken, signRefreshToken } from '../utils/tokens.js';

export async function registerUser(input, req) {
  const email = input.email.toLowerCase();
  const existingUser = await User.exists({ email });

  if (existingUser) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  const user = new User({
    name: input.name,
    email,
    password: input.password,
  });

  await user.save();

  return createAuthSession(user, req);
}

export async function createAuthSession(user, req) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const now = new Date();

  user.refreshTokens = user.refreshTokens.filter((session) => session.expiresAt > now);
  user.refreshTokens.push({
    tokenHash: hashToken(refreshToken),
    userAgent: req.get('user-agent') || '',
    ipAddress: req.ip || '',
    expiresAt: expiresInToDate(),
  });

  await user.save({ validateBeforeSave: false });

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
}

