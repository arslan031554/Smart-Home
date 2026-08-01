import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import crypto from 'crypto';
import * as adminController from '../controllers/admincontroller.js';
import * as offerController from '../controllers/offercontroller.js';
import protect from '../middlewares/authmiddleware.js';
import authorize, { requireAdminPermission } from '../middlewares/rolemiddleware.js';
import * as v from '../validators/adminvalidator.js';
import { adminOfferListQueryValidator } from '../validators/offervalidator.js';

const router = Router();
const rangeUploadDirectory = path.resolve(process.cwd(), 'uploads', 'ranges');
fs.mkdirSync(rangeUploadDirectory, { recursive: true });

const productUploadDirectory = path.resolve(process.cwd(), 'uploads', 'products');
fs.mkdirSync(productUploadDirectory, { recursive: true });

const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function safeImageExtension(file) {
    const originalExt = path.extname(file.originalname || '').toLowerCase();
    const mime = String(file.mimetype || '').toLowerCase();
    const ext = originalExt === '.jpeg' ? '.jpg' : originalExt;
    if (!ALLOWED_IMAGE_MIME.has(mime) || !ALLOWED_IMAGE_EXT.has(ext)) return null;
    if (mime === 'image/png' && ext !== '.png') return null;
    if (mime === 'image/webp' && ext !== '.webp') return null;
    if (mime === 'image/jpeg' && !['.jpg', '.jpeg'].includes(originalExt)) return null;
    return ext;
}

const productImageUpload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, productUploadDirectory),
        filename: (_req, file, cb) => {
            const extension = safeImageExtension(file) || '.jpg';
            cb(null, `product-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const extension = safeImageExtension(file);
        if (extension) return cb(null, true);
        cb(new Error('Only JPEG, PNG, and WEBP product images are allowed'));
    },
});

const handleProductImageUpload = (req, res, next) => {
    productImageUpload.single('imageFile')(req, res, (error) => {
        if (!error) return next();
        error.statusCode = 400;
        error.publicMessage = error.code === 'LIMIT_FILE_SIZE'
            ? 'Product image must be 5 MB or smaller'
            : (error.message || 'Product image upload failed');
        next(error);
    });
};

function parseJsonBodyFields(fields) {
    return (req, _res, next) => {
        fields.forEach((field) => {
            if (typeof req.body?.[field] !== 'string') return;
            const value = req.body[field].trim();
            if (!value) return;
            if (!value.startsWith('[') && !value.startsWith('{')) return;
            try {
                req.body[field] = JSON.parse(value);
            } catch (_) {
                // Let validators/service return the normal validation message.
            }
        });
        next();
    };
};


const rangeImageUpload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, rangeUploadDirectory),
        filename: (_req, file, cb) => {
            const extension = path.extname(file.originalname || '').toLowerCase() || '.jpg';
            cb(null, `range-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const mime = String(file.mimetype || '').toLowerCase();
        if (['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(mime)) {
            cb(null, true);
            return;
        }
        cb(new Error('Only JPG, PNG, and WEBP files are allowed'));
    },
});

const handleRangeImageUpload = (req, res, next) => {
    rangeImageUpload.single('image')(req, res, (error) => {
        if (!error) return next();
        error.statusCode = 400;
        error.publicMessage = error.message || 'Image upload failed';
        next(error);
    });
};

// All routes here require the platform admin role.
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', adminController.getStats);
router.get('/offers', requireAdminPermission('view_offers'), adminOfferListQueryValidator, offerController.listAdminOffers);
router.get('/projects', requireAdminPermission('view_offers'), adminController.projectHandlers.getAll);
router.post('/uploads/range-image', requireAdminPermission('edit_hardware'), handleRangeImageUpload, adminController.uploadRangeImage);

router.get('/employees', requireAdminPermission('manage_employees'), adminController.employeeHandlers.getAll);
router.get('/employees/:id', requireAdminPermission('manage_employees'), adminController.employeeHandlers.getOne);
router.post('/employees', requireAdminPermission('manage_employees'), v.employeeCreateValidator, adminController.employeeHandlers.create);
router.put('/employees/:id', requireAdminPermission('manage_employees'), v.employeeUpdateValidator, adminController.employeeHandlers.update);
router.delete('/employees/:id', requireAdminPermission('manage_employees'), adminController.employeeHandlers.delete);

router.get('/users', requireAdminPermission('manage_employees'), adminController.userHandlers.getAll);
router.get('/users/:id', requireAdminPermission('manage_employees'), adminController.userHandlers.getOne);

const registerCrudRoutes = (path, handlers, validator, permissions) => {
    router.get(`/${path}`, requireAdminPermission(permissions.view), handlers.getAll);
    router.get(`/${path}/:id`, requireAdminPermission(permissions.view), handlers.getOne);
    router.post(`/${path}`, requireAdminPermission(permissions.edit), validator, handlers.create);
    router.put(`/${path}/:id`, requireAdminPermission(permissions.edit), validator, handlers.update);
    router.delete(`/${path}/:id`, requireAdminPermission(permissions.delete), handlers.delete);
};

registerCrudRoutes('building-types', adminController.buildingTypeHandlers, v.buildingTypeValidator, { view: 'view_master', edit: 'edit_master', delete: 'delete_master' });
registerCrudRoutes('room-types', adminController.roomTypeHandlers, v.roomTypeValidator, { view: 'view_master', edit: 'edit_master', delete: 'delete_master' });
registerCrudRoutes('smart-functions', adminController.smartFunctionHandlers, v.smartFunctionValidator, { view: 'view_master', edit: 'edit_master', delete: 'delete_master' });
registerCrudRoutes('product-ranges', adminController.productRangeHandlers, v.productRangeValidator, { view: 'view_hardware', edit: 'edit_hardware', delete: 'edit_hardware' });
registerCrudRoutes('colors', adminController.colorHandlers, v.colorValidator, { view: 'view_hardware', edit: 'edit_hardware', delete: 'edit_hardware' });
router.get('/products', requireAdminPermission('view_hardware'), adminController.productHandlers.getAll);
router.get('/products/:id', requireAdminPermission('view_hardware'), adminController.productHandlers.getOne);
router.post('/products', requireAdminPermission('edit_hardware'), handleProductImageUpload, parseJsonBodyFields(['allowedRanges', 'allowedColors', 'rangeIds', 'colorIds', 'mappings', 'dependencies', 'mainProducts']), v.productCreateValidator, adminController.productHandlers.create);
router.put('/products/:id', requireAdminPermission('edit_hardware'), handleProductImageUpload, parseJsonBodyFields(['allowedRanges', 'allowedColors', 'rangeIds', 'colorIds', 'mappings', 'dependencies', 'mainProducts']), v.productUpdateValidator, adminController.productHandlers.update);
router.delete('/products/:id', requireAdminPermission('edit_hardware'), adminController.productHandlers.delete);
registerCrudRoutes('product-function-mappings', adminController.productFunctionMappingHandlers, v.productFunctionMappingValidator, { view: 'view_hardware', edit: 'edit_hardware', delete: 'edit_hardware' });
registerCrudRoutes('services', adminController.serviceHandlers, v.serviceValidator, { view: 'view_hardware', edit: 'edit_hardware', delete: 'edit_hardware' });
registerCrudRoutes('discount-rules', adminController.discountRuleHandlers, v.discountRuleValidator, { view: 'manage_rules', edit: 'manage_rules', delete: 'manage_rules' });
registerCrudRoutes('offer-conditions', adminController.offerConditionHandlers, v.offerConditionValidator, { view: 'manage_rules', edit: 'manage_rules', delete: 'manage_rules' });
registerCrudRoutes('disclaimers', adminController.disclaimerHandlers, v.disclaimerValidator, { view: 'manage_rules', edit: 'manage_rules', delete: 'manage_rules' });
registerCrudRoutes('followup-templates', adminController.followupTemplateHandlers, v.followupTemplateValidator, { view: 'manage_rules', edit: 'manage_rules', delete: 'manage_rules' });

router.post('/products/:id/ranges', requireAdminPermission('edit_hardware'), v.syncIdsValidator, adminController.syncProductRanges);
router.post('/products/:id/colors', requireAdminPermission('edit_hardware'), v.syncIdsValidator, adminController.syncProductColors);
router.post('/services/:id/functions', requireAdminPermission('edit_hardware'), v.syncIdsValidator, adminController.syncServiceFunctions);

export default router;
