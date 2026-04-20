import { Router } from 'express';
import authRoutes from './authroutes.js';
import adminRoutes from './adminroutes.js';
import projectRoutes from './projectroutes.js';
import offerRoutes from './offerroutes.js';
import dashboardRoutes from './dashboardroutes.js';
import masterDataRoutes from './masterdataroutes.js';
import configuratorDraftRoutes from './configuratordraftroutes.js';
import * as notificationController from '../controllers/notificationcontroller.js';
import { testEmailValidator } from '../validators/notificationvalidator.js';

const router = Router();

router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API health is OK'
    });
});

router.post('/test-email', testEmailValidator, notificationController.testEmail);

router.use('/auth', authRoutes);
router.use('/master-data', masterDataRoutes);
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/projects', projectRoutes);
router.use('/offers', offerRoutes);
router.use('/configurator-drafts', configuratorDraftRoutes);

export default router;
