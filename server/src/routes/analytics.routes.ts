import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { RoleEnum } from '@prisma/client';

const router = Router();

// GET /api/v1/analytics/dashboard/:branchId
router.get(
  '/dashboard/:branchId',
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN, RoleEnum.STAFF),
  analyticsController.getDashboardAnalytics
);

export default router;
