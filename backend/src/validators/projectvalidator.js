import { body } from 'express-validator';
import { validate } from '../middlewares/validatemiddleware.js';

const getAliasedValue = (req, primaryKey, aliases = []) => {
    const direct = req.body?.[primaryKey];
    if (direct !== undefined) return direct;
    for (const alias of aliases) {
        if (req.body?.[alias] !== undefined) return req.body[alias];
    }
    return undefined;
};

export const projectValidator = [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('buildingTypeId').custom((value, { req }) => {
        const candidate = value ?? getAliasedValue(req, 'buildingTypeId', ['buildingType']);
        if (!candidate || typeof candidate !== 'string') throw new Error('Building type is required');
        const normalized = String(candidate).trim();
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)) {
            throw new Error('Building Type ID must be a valid UUID');
        }
        return true;
    }),
    body('levelsCount').custom((value, { req }) => {
        const candidate = value ?? getAliasedValue(req, 'levelsCount');
        const parsed = parseInt(candidate, 10);
        if (!Number.isFinite(parsed) || parsed < 1) throw new Error('Levels count must be at least 1');
        return true;
    }),
    body('builtUpArea').custom((value, { req }) => {
        const candidate = value ?? getAliasedValue(req, 'builtUpArea', ['area']);
        const parsed = Number(candidate);
        if (!Number.isFinite(parsed) || parsed <= 0) throw new Error('Built-up area must be greater than 0');
        return true;
    }),
    body('projectComplexity').optional({ values: 'null' }).isString().trim(),
    body('multiplicationIndex').custom((value, { req }) => {
        const candidate = value ?? getAliasedValue(req, 'multiplicationIndex', ['projectMultiplicationIndex']);
        const parsed = Number(candidate);
        if (!Number.isFinite(parsed) || parsed < 1) throw new Error('Multiplication index must be at least 1');
        return true;
    }),
    body('description').optional({ values: 'null' }).isString().trim(),
    body('status').optional().isIn(['draft', 'active', 'archived']).withMessage('Invalid project status'),
    validate
];

export const projectUpdateValidator = [
    body('name').optional().trim().notEmpty().withMessage('Project name must be non-empty'),
    body('buildingTypeId').optional({ values: 'null' }).isUUID().withMessage('Building Type ID must be a valid UUID'),
    body('levelsCount').optional().isInt({ min: 1 }).withMessage('Levels count must be at least 1'),
    body('builtUpArea').optional().isFloat({ gt: 0 }).withMessage('Built-up area must be greater than 0'),
    body('projectComplexity').optional({ values: 'null' }).isString().trim(),
    body('multiplicationIndex').optional().isFloat({ min: 1 }).withMessage('Multiplication index must be at least 1'),
    body('description').optional({ values: 'null' }).isString().trim(),
    body('status').optional().isIn(['draft', 'active', 'archived']).withMessage('Invalid project status'),
    body().custom((value) => {
        if (!value || !Object.keys(value).length) throw new Error('At least one project field is required');
        return true;
    }),
    validate
];

export const levelValidator = [
    body('name').notEmpty().withMessage('Level name is required'),
    body('levelOrder').isInt({ min: 0 }).withMessage('Level order must be a non-negative integer'),
    validate
];

export const roomValidator = [
    body('projectLevelId').isUUID().withMessage('Project Level ID is required'),
    body('roomTypeId').isUUID().withMessage('Room Type ID is required'),
    body('name').notEmpty().withMessage('Room name is required'),
    body('roomCount').optional().isInt({ min: 1 }).withMessage('Room count must be at least 1'),
    validate
];

export const functionSelectionValidator = [
    body('smartFunctionId').isUUID().withMessage('Smart Function ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validate
];
