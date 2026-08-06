import { Router } from 'express';
import { branchController } from '../controllers/branch.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { RoleEnum } from '@prisma/client';
import { updateWorkingHourSchema } from '../validators/branch.validator';

const router = Router();

router.use(authenticate);

router.put(
  '/:id',
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  validateRequest(updateWorkingHourSchema),
  branchController.updateWorkingHour
);

router.delete(
  '/:id',
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  branchController.deleteWorkingHour
);

export default router;
