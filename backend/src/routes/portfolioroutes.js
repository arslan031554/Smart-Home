import { Router } from 'express';
import * as portfolioController from '../controllers/portfoliocontroller.js';

const router = Router();

router.get('/', portfolioController.getAllPublic);
router.get('/:id', portfolioController.getOnePublic);

export default router;
