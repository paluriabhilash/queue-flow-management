import { Request, Response } from 'express';
import { authService, AuthService } from '../services/auth.service';
import { sendResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

export class AuthController {
  private service: AuthService;

  constructor(service: AuthService = authService) {
    this.service = service;
  }

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.register(req.body);
    return sendResponse(res, 201, 'User account registered successfully', result);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.login(req.body);
    return sendResponse(res, 200, 'Authentication successful', result);
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      return sendResponse(res, 401, 'Unauthenticated user', null, 'Authentication required');
    }
    await this.service.logout(req.user.userId);
    return sendResponse(res, 200, 'Logout completed successfully', null);
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      return sendResponse(res, 401, 'Unauthenticated user', null, 'Authentication required');
    }
    const userProfile = await this.service.getCurrentUser(req.user.userId);
    return sendResponse(res, 200, 'User profile retrieved successfully', userProfile);
  });
}

export const authController = new AuthController();
