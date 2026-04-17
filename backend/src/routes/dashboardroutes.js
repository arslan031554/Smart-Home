import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardcontroller.js';
import protect from '../middlewares/authmiddleware.js';

const router = Router();
router.use(protect);
router.get('/', dashboardController.getDashboard);

export default router;
