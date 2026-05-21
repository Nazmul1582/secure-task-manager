import { registerUser } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getRefreshCookieOptions, REFRESH_TOKEN_COOKIE_NAME } from '../utils/tokens.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const register = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await registerUser(req.validated.body, req);

  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, getRefreshCookieOptions());

  sendSuccess(res, {
    statusCode: 201,
    message: 'Registration successful',
    data: {
      user,
      accessToken,
    },
  });
});

