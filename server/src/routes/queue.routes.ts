import { Router } from 'express';
import { queueController } from '../controllers/queue.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { RoleEnum } from '@prisma/client';
import {
  generateTokenSchema,
  tokenIdSchema,
  counterIdSchema,
  callNextSchema,
} from '../validators/queue.validator';

const router = Router();

// Token Generation (Public or Authenticated Customer/Staff)
router.post(
  '/token',
  (req, res, next) => {
    // Optional auth check: if Authorization header present, run authenticate middleware
    if (req.headers.authorization) {
      return authenticate(req, res, next);
    }
    next();
  },
  validateRequest(generateTokenSchema),
  queueController.generateToken
);

// Customer Active Tokens
router.get(
  '/my-token',
  authenticate,
  queueController.getMyActiveTokens
);

// Public / Customer Token Position Lookup
router.get(
  '/position/:tokenId',
  validateRequest(tokenIdSchema),
  queueController.getTokenPosition
);

// Staff Counter Dashboard
router.get(
  '/counter/:counterId',
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN, RoleEnum.STAFF),
  validateRequest(counterIdSchema),
  queueController.getCounterDashboard
);

// Call Next Token
router.post(
  '/next',
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN, RoleEnum.STAFF),
  validateRequest(callNextSchema),
  queueController.callNextToken
);

// Start Service (CALLED -> SERVING)
router.post(
  '/:tokenId/start',
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN, RoleEnum.STAFF),
  validateRequest(tokenIdSchema),
  queueController.startService
);

// Complete Service (SERVING -> COMPLETED)
router.post(
  '/:tokenId/complete',
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN, RoleEnum.STAFF),
  validateRequest(tokenIdSchema),
  queueController.completeService
);

// Skip Token (CALLED -> SKIPPED)
router.post(
  '/:tokenId/skip',
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN, RoleEnum.STAFF),
  validateRequest(tokenIdSchema),
  queueController.skipToken
);

// Cancel Token (WAITING/CALLED -> CANCELLED)
router.post(
  '/:tokenId/cancel',
  authenticate,
  validateRequest(tokenIdSchema),
  queueController.cancelToken
);

// Delete Token Ticket (COMPLETED/CANCELLED/SKIPPED or Customer cleanup)
router.delete(
  '/:tokenId',
  authenticate,
  validateRequest(tokenIdSchema),
  queueController.deleteToken
);

// Public Branch Display Board Data
router.get(
  '/display/:branchId',
  queueController.getBranchDisplayBoard
);

export default router;
