import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

const durationUnits = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: env.ACCESS_TOKEN_EXPIRES,
    },
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      jti: crypto.randomUUID(),
    },
    env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: env.REFRESH_TOKEN_EXPIRES,
    },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function expiresInToDate(expiresIn = env.REFRESH_TOKEN_EXPIRES) {
  const durationMs = parseDuration(expiresIn);
  return new Date(Date.now() + durationMs);
}

export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE || env.COOKIE_SAME_SITE === 'none',
    sameSite: env.COOKIE_SAME_SITE,
    path: '/api/auth',
    maxAge: parseDuration(env.REFRESH_TOKEN_EXPIRES),
  };
}

function parseDuration(value) {
  if (typeof value === 'number') {
    return value * 1000;
  }

  const trimmedValue = String(value).trim();
  const match = trimmedValue.match(/^(\d+)(ms|s|m|h|d)$/);

  if (!match) {
    throw new Error(`Unsupported token duration: ${value}`);
  }

  const [, amount, unit] = match;
  return Number(amount) * durationUnits[unit];
}

