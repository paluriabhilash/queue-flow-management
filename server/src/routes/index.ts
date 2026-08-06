import { Router } from 'express';
import authRoutes from './auth.routes';
import organizationRoutes from './organization.routes';
import branchRoutes from './branch.routes';
import workingHoursRoutes from './working-hours.routes';
import holidayRoutes from './holiday.routes';
import serviceRoutes from './service.routes';
import ticketRoutes from './ticket.routes';
import counterRoutes from './counter.routes';
import queueRoutes from './queue.routes';
import adminRoutes from './admin.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/branches', branchRoutes);
router.use('/working-hours', workingHoursRoutes);
router.use('/holidays', holidayRoutes);
router.use('/services', serviceRoutes);
router.use('/tickets', ticketRoutes);
router.use('/counters', counterRoutes);
router.use('/queue', queueRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
