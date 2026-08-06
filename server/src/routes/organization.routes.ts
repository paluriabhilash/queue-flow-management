import { Router } from 'express';
import { organizationController } from '../controllers/organization.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { RoleEnum } from '@prisma/client';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  getOrganizationSchema,
  updateSettingsSchema,
} from '../validators/organization.validator';

const router = Router();

// All organization management routes require authentication
router.use(authenticate);

// Create Organization (SUPER_ADMIN only)
router.post(
  '/',
  authorize(RoleEnum.SUPER_ADMIN),
  validateRequest(createOrganizationSchema),
  organizationController.create
);

// Get Organization Details (SUPER_ADMIN, ORG_ADMIN, STAFF)
router.get(
  '/:id',
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN, RoleEnum.STAFF),
  validateRequest(getOrganizationSchema),
  organizationController.getDetails
);

// Update Organization Profile (SUPER_ADMIN, ORG_ADMIN)
router.put(
  '/:id',
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  validateRequest(updateOrganizationSchema),
  organizationController.update
);

// Get Organization Settings (SUPER_ADMIN, ORG_ADMIN, STAFF)
router.get(
  '/:id/settings',
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN, RoleEnum.STAFF),
  validateRequest(getOrganizationSchema),
  organizationController.getSettings
);

// Update Organization Settings (SUPER_ADMIN, ORG_ADMIN)
router.put(
  '/:id/settings',
  authorize(RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN),
  validateRequest(updateSettingsSchema),
  organizationController.updateSettings
);

export default router;
