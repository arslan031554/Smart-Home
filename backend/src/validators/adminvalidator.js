import { body } from 'express-validator';
import { validate } from '../middlewares/validatemiddleware.js';

export const buildingTypeValidator = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }).withMessage('Name must be at most 120 characters'),
    validate
];

export const roomTypeValidator = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }).withMessage('Name must be at most 120 characters'),
    body('buildingTypes').optional().isArray().withMessage('buildingTypes must be an array'),
    body('buildingTypes.*').optional().isUUID().withMessage('Each building type ID must be a valid UUID'),
    validate
];

export const smartFunctionValidator = [
    body('code').trim().notEmpty().withMessage('Code is required').isLength({ max: 60 }).withMessage('Code must be at most 60 characters'),
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }).withMessage('Name must be at most 120 characters'),
    body('channelType').optional().isIn(['IN', 'OUT', 'GENERAL']).withMessage('Invalid channel type'),
    body('inputChannelCount').optional().isInt({ min: 0 }).withMessage('Input channel count must be a non-negative integer'),
    body('outputChannelCount').optional().isInt({ min: 0 }).withMessage('Output channel count must be a non-negative integer'),
    body('generalChannelCount').optional().isInt({ min: 0 }).withMessage('General channel count must be a non-negative integer'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
    body('roomTypes').optional().isArray().withMessage('roomTypes must be an array'),
    body('roomTypes.*').optional().isUUID().withMessage('Each room type ID must be a valid UUID'),
    validate
];

export const productRangeValidator = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }).withMessage('Name must be at most 120 characters'),
    body('imageUrl').optional({ values: 'falsy' }).isString().withMessage('imageUrl must be a string').isLength({ max: 255 }).withMessage('imageUrl must be at most 255 characters'),
    body('isVisible').optional().isBoolean().withMessage('isVisible must be a boolean'),
    body('priceMultiplier')
        .optional({ values: 'null' })
        .custom((value) => {
            if (value === undefined || value === null || value === '') return true;
            const n = Number(value);
            if (!Number.isFinite(n) || n <= 0) throw new Error('priceMultiplier must be a number greater than 0');
            return true;
        }),
    validate
];

export const colorValidator = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }).withMessage('Name must be at most 120 characters'),
    body('hex').optional().trim().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Hex must be e.g. #FFF or #FFFFFF'),
    body('isVisible').optional().isBoolean().withMessage('isVisible must be a boolean'),
    body('productRanges').optional().isArray().withMessage('productRanges must be an array'),
    body('productRanges.*').optional().isUUID().withMessage('Each product range ID must be a valid UUID'),
    validate
];

export const productValidator = [
    body('code').trim().notEmpty().withMessage('Code is required').isLength({ max: 60 }).withMessage('Code must be at most 60 characters'),
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }).withMessage('Name must be at most 200 characters'),
    body('unitPriceEurExVat').optional().custom((value) => {
        if (value === undefined) return true;
        if (value === null || value === '') throw new Error('Price is required');
        const n = Number(value);
        if (!Number.isFinite(n) || n <= 0) throw new Error('Price must be a number greater than 0');
        return true;
    }),
    body('price').optional().custom((value) => {
        if (value === undefined) return true;
        if (value === null || value === '') throw new Error('Price is required');
        const n = Number(value);
        if (!Number.isFinite(n) || n <= 0) throw new Error('Price must be a number greater than 0');
        return true;
    }),
    body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be at most 2000 characters'),
    body('allowedRanges').optional().isArray().withMessage('allowedRanges must be an array'),
    body('allowedRanges.*').optional().isUUID().withMessage('Invalid range ID'),
    body('allowedColors').optional().isArray().withMessage('allowedColors must be an array'),
    body('allowedColors.*').optional().isUUID().withMessage('Invalid color ID'),
    body('mappings').optional().isArray().withMessage('mappings must be an array'),
    body('productType').optional().isIn(['STANDARD', 'RELATED']).withMessage('Invalid product type'),
    body('dependencies').optional().isArray().withMessage('dependencies must be an array'),
    body('dependencies.*.mainProductId').optional().isUUID().withMessage('Each main product ID must be a valid UUID'),
    body('dependencies.*.quantityPerMainProduct').optional().isFloat({ min: 0.000001 }).withMessage('Quantity per main product must be greater than 0'),
    validate
];

export const productCreateValidator = [
    body('code').trim().notEmpty().withMessage('Code is required').isLength({ max: 60 }).withMessage('Code must be at most 60 characters'),
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }).withMessage('Name must be at most 200 characters'),
    body().custom((_, { req }) => {
        const hasPrice = req.body && (req.body.price !== undefined || req.body.unitPriceEurExVat !== undefined);
        if (!hasPrice) throw new Error('Price is required and must be greater than 0');
        return true;
    }),
    body('unitPriceEurExVat').optional().custom((value) => {
        if (value === undefined) return true;
        if (value === null || value === '') throw new Error('Price is required');
        const n = Number(value);
        if (!Number.isFinite(n) || n <= 0) throw new Error('Price must be a number greater than 0');
        return true;
    }),
    body('price').optional().custom((value) => {
        if (value === undefined) return true;
        if (value === null || value === '') throw new Error('Price is required');
        const n = Number(value);
        if (!Number.isFinite(n) || n <= 0) throw new Error('Price must be a number greater than 0');
        return true;
    }),
    body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be at most 2000 characters'),
    body('allowedRanges').optional().isArray().withMessage('allowedRanges must be an array'),
    body('allowedRanges.*').optional().isUUID().withMessage('Invalid range ID'),
    body('allowedColors').optional().isArray().withMessage('allowedColors must be an array'),
    body('allowedColors.*').optional().isUUID().withMessage('Invalid color ID'),
    body('mappings').optional().isArray().withMessage('mappings must be an array'),
    body('productType').optional().isIn(['STANDARD', 'RELATED']).withMessage('Invalid product type'),
    body('dependencies').optional().isArray().withMessage('dependencies must be an array'),
    body('dependencies.*.mainProductId').optional().isUUID().withMessage('Each main product ID must be a valid UUID'),
    body('dependencies.*.quantityPerMainProduct').optional().isFloat({ min: 0.000001 }).withMessage('Quantity per main product must be greater than 0'),
    validate
];

export const productUpdateValidator = [
    body('code').trim().notEmpty().withMessage('Code is required').isLength({ max: 60 }).withMessage('Code must be at most 60 characters'),
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }).withMessage('Name must be at most 200 characters'),
    body('unitPriceEurExVat').optional().custom((value) => {
        if (value === undefined) return true;
        if (value === null || value === '') throw new Error('Price must be a number greater than 0');
        const n = Number(value);
        if (!Number.isFinite(n) || n <= 0) throw new Error('Price must be a number greater than 0');
        return true;
    }),
    body('price').optional().custom((value) => {
        if (value === undefined) return true;
        if (value === null || value === '') throw new Error('Price must be a number greater than 0');
        const n = Number(value);
        if (!Number.isFinite(n) || n <= 0) throw new Error('Price must be a number greater than 0');
        return true;
    }),
    body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be at most 2000 characters'),
    body('allowedRanges').optional().isArray().withMessage('allowedRanges must be an array'),
    body('allowedRanges.*').optional().isUUID().withMessage('Invalid range ID'),
    body('allowedColors').optional().isArray().withMessage('allowedColors must be an array'),
    body('allowedColors.*').optional().isUUID().withMessage('Invalid color ID'),
    body('mappings').optional().isArray().withMessage('mappings must be an array'),
    body('productType').optional().isIn(['STANDARD', 'RELATED']).withMessage('Invalid product type'),
    body('dependencies').optional().isArray().withMessage('dependencies must be an array'),
    body('dependencies.*.mainProductId').optional().isUUID().withMessage('Each main product ID must be a valid UUID'),
    body('dependencies.*.quantityPerMainProduct').optional().isFloat({ min: 0.000001 }).withMessage('Quantity per main product must be greater than 0'),
    validate
];

export const productFunctionMappingValidator = [
    body('productId').isUUID().withMessage('Product ID must be a valid UUID'),
    body('smartFunctionId').isUUID().withMessage('Smart Function ID must be a valid UUID'),
    body('channelType').isIn(['IN', 'OUT', 'GENERAL']).withMessage('Invalid channel type'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    body('calculationScope').isIn(['room', 'level', 'project']).withMessage('Invalid calculation scope'),
    body('priority').optional().isInt().withMessage('Priority must be an integer'),
    validate
];

export const serviceValidator = [
    body('code').optional().trim().notEmpty().withMessage('Code must be non-empty when provided').isLength({ max: 60 }).withMessage('Code must be at most 60 characters'),
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }).withMessage('Name must be at most 200 characters'),
    body('unitPriceEurExVat').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('pricingMode').optional().isIn(['fixed_project', 'per_room', 'per_level', 'per_product_qty', 'per_function_qty']).withMessage('Invalid pricing mode'),
    body('type').optional().isIn(['fixed_project', 'per_room', 'per_level', 'per_product_qty', 'per_function_qty']).withMessage('Invalid pricing mode'),
    body('isOptionalForCustomer').optional().isBoolean().withMessage('isOptionalForCustomer must be a boolean'),
    body('smartFunctions').optional().isArray().withMessage('smartFunctions must be an array'),
    body('smartFunctions.*').optional().isUUID().withMessage('Each smart function ID must be a valid UUID'),
    validate
];

export const discountRuleValidator = [
    body('minMultiplier').isFloat({ min: 0 }).withMessage('Min multiplier must be positive'),
    body('maxMultiplier').isFloat({ min: 0 }).withMessage('Max multiplier must be positive'),
    body('discountPercent').isFloat({ min: 0, max: 100 }).withMessage('Discount percent must be between 0 and 100'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    validate
];

export const offerConditionValidator = [
    body('text').trim().notEmpty().withMessage('Text is required').isLength({ max: 10000 }).withMessage('Text must be at most 10000 characters'),
    body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    validate
];

export const disclaimerValidator = [
    body('text').trim().notEmpty().withMessage('Text is required').isLength({ max: 10000 }).withMessage('Text must be at most 10000 characters'),
    body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    validate
];

export const followupTemplateValidator = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }).withMessage('Name must be at most 200 characters'),
    body('channel').isIn(['email', 'sms']).withMessage('Channel must be email or sms'),
    body('step').isInt({ min: 1, max: 10 }).withMessage('Step must be between 1 and 10'),
    body('language').optional().isIn(['en', 'ro']).withMessage('Language must be en or ro'),
    body('subject').optional({ values: 'null' }).isLength({ max: 200 }).withMessage('Subject must be at most 200 characters'),
    body('body').trim().notEmpty().withMessage('Body is required').isLength({ max: 10000 }).withMessage('Body must be at most 10000 characters'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    validate
];

export const syncIdsValidator = [
    body('rangeIds').optional().isArray().withMessage('rangeIds must be an array'),
    body('colorIds').optional().isArray().withMessage('colorIds must be an array'),
    body('functionIds').optional().isArray().withMessage('functionIds must be an array'),
    validate
];

export const employeeCreateValidator = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }).withMessage('Name must be at most 120 characters'),
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email is required'),
    body('password').trim().notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').trim().notEmpty().withMessage('Employee role is required').isLength({ max: 80 }).withMessage('Employee role must be at most 80 characters'),
    body('permissions').optional().isArray().withMessage('permissions must be an array'),
    body('permissions.*').optional().isString().withMessage('permissions must contain strings'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    validate
];

export const employeeUpdateValidator = [
    body('name').optional().trim().notEmpty().withMessage('Name must be non-empty').isLength({ max: 120 }).withMessage('Name must be at most 120 characters'),
    body('email').optional().trim().notEmpty().withMessage('Email must be non-empty').isEmail().withMessage('Valid email is required'),
    body('password').optional().trim().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().trim().notEmpty().withMessage('Employee role must be non-empty').isLength({ max: 80 }).withMessage('Employee role must be at most 80 characters'),
    body('permissions').optional().isArray().withMessage('permissions must be an array'),
    body('permissions.*').optional().isString().withMessage('permissions must contain strings'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    validate
];

export const userUpdateValidator = [
    body('fullName').optional({ values: 'null' }).isString().trim().isLength({ max: 120 }).withMessage('Full name must be at most 120 characters'),
    body('email').optional().trim().notEmpty().withMessage('Email must be non-empty').isEmail().withMessage('Valid email is required'),
    body('phone').optional({ values: 'null' }).isString().trim().isLength({ max: 30 }).withMessage('Phone must be at most 30 characters'),
    body('companyName').optional({ values: 'null' }).isString().trim().isLength({ max: 160 }).withMessage('Company name must be at most 160 characters'),
    body('role').optional().isIn(['customer', 'employee', 'admin']).withMessage('Role must be customer, employee, or admin'),
    body('employeeRole').optional({ values: 'null' }).isString().trim().isLength({ max: 80 }).withMessage('Employee role must be at most 80 characters'),
    body('permissions').optional().isArray().withMessage('permissions must be an array'),
    body('permissions.*').optional().isString().withMessage('permissions must contain strings'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean'),
    body('password').optional().isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    validate
];
