import { Router } from 'express';
import { counterController } from '../controllers/counter.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { RoleEnum } from '@prisma/client';
import {
  createCounterSchema,
  updateCounterSchema,
  getCounterSchema,
  assignStaffSchema,
  assignServicesSchema,
} from '../validators/counter.validator';

const router = Router();

router.use(authenticate);

// Counter CRUD Endpoints
router.post(
  '/',
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  validateRequest(createCounterSchema),
  counterController.createCounter
);

router.get(
  '/',
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN, RoleEnum.STAFF),
  counterController.getCounters
);

router.get(
  '/:id',
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN, RoleEnum.STAFF),
  validateRequest(getCounterSchema),
  counterController.getCounterById
);

router.put(
  '/:id',
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  validateRequest(updateCounterSchema),
  counterController.updateCounter
);

router.delete(
  '/:id',
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  validateRequest(getCounterSchema),
  counterController.deleteCounter
);

// Staff Assignment Endpoints
router.post(
  '/:id/staff',
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  validateRequest(assignStaffSchema),
  counterController.assignStaff
);

router.delete(
  '/:id/staff/:staffId',
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  counterController.removeStaff
);

// Service Assignment Endpoints
router.post(
  '/:id/services',
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  validateRequest(assignServicesSchema),
  counterController.assignServices
);

router.get(
  '/:id/services',
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN, RoleEnum.STAFF),
  validateRequest(getCounterSchema),
  counterController.getCounterServices
);

router.delete(
  '/:id/services/:serviceId',
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  counterController.removeService
);

export default router;
