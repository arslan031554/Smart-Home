import { Router } from 'express';
import protect from '../middlewares/authmiddleware.js';
import * as configuratorDraftController from '../controllers/configuratordraftcontroller.js';

const router = Router();

router.get('/current/public', configuratorDraftController.getPublicCurrentDraft);
router.put('/current/public', configuratorDraftController.upsertPublicCurrentDraft);

router.use(protect);
router.get('/current', configuratorDraftController.getCurrentDraft);
router.put('/current', configuratorDraftController.upsertCurrentDraft);
router.post('/current/attach', configuratorDraftController.attachGuestDraft);
router.post('/current/complete', configuratorDraftController.completeCurrentDraft);

export default router;
