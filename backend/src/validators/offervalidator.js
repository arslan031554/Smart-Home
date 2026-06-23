import { body, query } from 'express-validator';
import { validate } from '../middlewares/validatemiddleware.js';
import { isValidOfferStatus } from '../constants/offerStatus.js';

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
    body('status').optional({ values: 'falsy' }).custom(isValidOfferStatus).withMessage('Invalid offer status'),
    body('offerStatus').optional({ values: 'falsy' }).custom(isValidOfferStatus).withMessage('Invalid offer status'),
    validate
];

const SORT_OPTIONS = [
    'created_at_desc',
    'created_at_asc',
    'value_desc',
    'value_asc',
    'status_asc',
    'status_desc',
];

export const adminOfferListQueryValidator = [
    query('status').optional({ values: 'falsy' }).custom(isValidOfferStatus).withMessage('Invalid offer status'),
    query('date_from').optional({ values: 'falsy' }).isISO8601({ strict: true }).withMessage('date_from must be a valid ISO date'),
    query('date_to').optional({ values: 'falsy' }).isISO8601({ strict: true }).withMessage('date_to must be a valid ISO date'),
    query('client').optional({ values: 'falsy' }).trim().isLength({ max: 160 }).withMessage('client must be at most 160 characters'),
    query('min_value').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('min_value must be a non-negative number'),
    query('max_value').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('max_value must be a non-negative number'),
    query('page').optional({ values: 'falsy' }).isInt({ min: 1, max: 10000 }).withMessage('page must be a positive integer'),
    query('limit').optional({ values: 'falsy' }).isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    query('sort').optional({ values: 'falsy' }).isIn(SORT_OPTIONS).withMessage(`sort must be one of: ${SORT_OPTIONS.join(', ')}`),
    query().custom((value) => {
        if (value.date_from && value.date_to && new Date(value.date_from) > new Date(value.date_to)) {
            throw new Error('date_from must be before or equal to date_to');
        }
        if (value.min_value !== undefined && value.max_value !== undefined && value.min_value !== '' && value.max_value !== '') {
            const min = Number(value.min_value);
            const max = Number(value.max_value);
            if (Number.isFinite(min) && Number.isFinite(max) && min > max) {
                throw new Error('min_value must be less than or equal to max_value');
            }
        }
        return true;
    }),
    validate
];
