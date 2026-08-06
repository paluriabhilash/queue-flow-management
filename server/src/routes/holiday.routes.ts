import { Router } from 'express';
import { branchController } from '../controllers/branch.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { RoleEnum } from '@prisma/client';
import { updateHolidaySchema } from '../validators/branch.validator';

const router = Router();

router.use(authenticate);

router.put(
  '/:id',
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  validateRequest(updateHolidaySchema),
  branchController.updateHoliday
);

router.delete(
  '/:id',
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  branchController.deleteHoliday
);

export default router;
