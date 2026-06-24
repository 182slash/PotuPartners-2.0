import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as authService from './auth.service';
import { REFRESH_COOKIE_NAME, refreshCookieOptions } from '../../utils/auth';
import { env } from '../../config/env';

// POST /api/auth/register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body as {
    email: string; password: string; fullName: string;
  };

  const { user, accessToken, refreshToken } = await authService.register(email, password, fullName);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

  res.status(201).json({
    success: true,
    data:    { user, accessToken },
    message: 'Account created successfully',
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const { user, accessToken, refreshToken } = await authService.login(email, password);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

  res.json({
    success: true,
    data:    { user, accessToken },
    message: 'Login successful',
  });
});

// POST /api/auth/refresh
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies[REFRESH_COOKIE_NAME] as string | undefined;

  if (!token) {
    res.status(401).json({ success: false, error: 'No refresh token provided' });
    return;
  }

  const { user, accessToken, newRefreshToken } = await authService.refreshAccessToken(token);

  res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions);

  res.json({
    success: true,
    data:    { user, accessToken },
  });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token  = req.cookies[REFRESH_COOKIE_NAME] as string | undefined;
  const userId = req.user!.sub;

  await authService.logout(userId, token);

  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });

  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.sub);
  res.json({ success: true, data: user });
});
