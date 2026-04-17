import { body } from 'express-validator';
import { validate } from '../middlewares/validatemiddleware.js';

const optionalUuidOrString = (value) => value == null || value === '' || typeof value === 'string';

export const calculateValidator = [
    body('levels')
        .optional({ values: 'null' })
        .isArray()
        .withMessage('levels must be an array'),
    body('levels.*.rooms').optional({ values: 'null' }).isArray().withMessage('Each level must have a rooms array (can be empty)'),
    body('rangeId').optional({ values: 'null' }).custom(optionalUuidOrString).withMessage('rangeId must be string or empty'),
    body('colorId').optional({ values: 'null' }).custom(optionalUuidOrString).withMessage('colorId must be string or empty'),
    body('selectedRangeId').optional({ values: 'null' }).custom(optionalUuidOrString).withMessage('selectedRangeId must be string or empty'),
    body('selectedColorId').optional({ values: 'null' }).custom(optionalUuidOrString).withMessage('selectedColorId must be string or empty'),
    validate
];

export const createOfferValidator = [
    body('projectId').isUUID().withMessage('Project ID is required'),
    body('levels').isArray({ min: 1 }).withMessage('Calculation data (levels) is required'),
    validate
];
