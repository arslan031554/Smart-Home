import { Router } from 'express';
import * as offerController from '../controllers/offercontroller.js';
import protect from '../middlewares/authmiddleware.js';
import { requireAdminPermission } from '../middlewares/rolemiddleware.js';
import {
    calculateValidator,
    createOfferValidator
} from '../validators/offervalidator.js';

const router = Router();

const requireOfferPermissionForBackoffice = (permission) => (req, res, next) => {
    if (req.user?.role === 'admin') {
        return requireAdminPermission(permission)(req, res, next);
    }
    return next();
};

router.post('/calculate', calculateValidator, offerController.calculate);

router.use(protect);

router.post('/from-config', offerController.createOfferFromConfig);
router.put('/:id/from-config', offerController.updateOfferFromConfig);
router.post('/', createOfferValidator, offerController.createOffer);
router.get('/', requireOfferPermissionForBackoffice('view_offers'), offerController.listOffers);
router.get('/:id', requireOfferPermissionForBackoffice('view_offers'), offerController.getOfferDetails);
router.delete('/:id', requireOfferPermissionForBackoffice('delete_offers'), offerController.deleteOffer);
router.put('/:id/status', requireOfferPermissionForBackoffice('edit_offers'), offerController.updateStatus);
router.post('/:id/duplicate', requireOfferPermissionForBackoffice('edit_offers'), offerController.duplicateOffer);
router.patch('/:id/followup', requireOfferPermissionForBackoffice('edit_offers'), offerController.updateFollowup);

router.get('/:id/export/excel', requireOfferPermissionForBackoffice('view_offers'), offerController.exportExcel);
router.get('/:id/export/pdf', requireOfferPermissionForBackoffice('view_offers'), offerController.exportPdf);
router.post('/:id/export/excel', requireOfferPermissionForBackoffice('view_offers'), offerController.exportExcel);
router.post('/:id/export/pdf', requireOfferPermissionForBackoffice('view_offers'), offerController.exportPdf);

export default router;
