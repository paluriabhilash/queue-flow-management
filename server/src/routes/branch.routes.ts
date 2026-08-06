import { Router } from 'express';
import { branchController } from '../controllers/branch.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { RoleEnum } from '@prisma/client';
import {
  createBranchSchema,
  updateBranchSchema,
  getBranchSchema,
  createWorkingHourSchema,
  createHolidaySchema,
} from '../validators/branch.validator';

const router = Router();

// Optional authentication middleware helper
const optionalAuth = (req: any, res: any, next: any) => {
  if (req.headers.authorization) {
    return authenticate(req, res, next);
  }
  next();
};

// Branch CRUD Endpoints
router.post(
  '/',
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  validateRequest(createBranchSchema),
  branchController.createBranch
);

router.get(
  '/',
  optionalAuth,
  branchController.getBranches
);

router.get(
  '/:id',
  optionalAuth,
  validateRequest(getBranchSchema),
  branchController.getBranchById
);

router.put(
  '/:id',
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  validateRequest(updateBranchSchema),
  branchController.updateBranch
);

router.delete(
  '/:id',
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  validateRequest(getBranchSchema),
  branchController.deleteBranch
);

// Branch Working Hours Sub-routes
router.post(
  '/:id/working-hours',
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  validateRequest(createWorkingHourSchema),
  branchController.createWorkingHour
);

router.get(
  '/:id/working-hours',
  optionalAuth,
  validateRequest(getBranchSchema),
  branchController.getWorkingHours
);

// Branch Holidays Sub-routes
router.post(
  '/:id/holidays',
  authenticate,
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  validateRequest(createHolidaySchema),
  branchController.createHoliday
);

router.get(
  '/:id/holidays',
  optionalAuth,
  validateRequest(getBranchSchema),
  branchController.getHolidays
);

export default router;
