import { body } from 'express-validator';
import { validate } from '../middlewares/validatemiddleware.js';

export const testEmailValidator = [
    body('to').isEmail().withMessage('Please provide a valid recipient email'),
    body('subject').optional({ values: 'null' }).isString().trim().notEmpty().withMessage('subject must be a non-empty string'),
    body('text').optional({ values: 'null' }).isString().withMessage('text must be a string'),
    body('html').optional({ values: 'null' }).isString().withMessage('html must be a string'),
    validate,
];
