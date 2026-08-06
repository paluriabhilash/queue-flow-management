import { Router } from 'express';
import { serviceController } from '../controllers/service.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { RoleEnum } from '@prisma/client';
import {
  createServiceSchema,
  updateServiceSchema,
  getServiceSchema,
} from '../validators/service.validator';

const router = Router();

const optionalAuth = (req: any, res: any, next: any) => {
  if (req.headers.authorization) {
    return authenticate(req, res, next);
  }
  next();
};

// Create Service (SUPER_ADMIN, ORG_ADMIN)
router.post(
  '/',
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  validateRequest(createServiceSchema),
  serviceController.createService
);

// Get Services (Public/Customer or Authenticated User)
router.get(
  '/',
  optionalAuth,
  serviceController.getServices
);

// Get Service Details
router.get(
  '/:id',
  optionalAuth,
  validateRequest(getServiceSchema),
  serviceController.getServiceById
);

// Update Service (SUPER_ADMIN, ORG_ADMIN)
router.put(
  '/:id',
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  validateRequest(updateServiceSchema),
  serviceController.updateService
);

// Soft Delete Service (SUPER_ADMIN, ORG_ADMIN)
router.delete(
  '/:id',
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  validateRequest(getServiceSchema),
  serviceController.deleteService
);

export default router;
