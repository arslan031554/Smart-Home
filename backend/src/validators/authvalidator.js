import { body } from 'express-validator';
import { validate } from '../middlewares/validatemiddleware.js';

const optionalTrimmedString = (field) =>
    body(field)
        .optional({ values: 'null' })
        .isString().withMessage(`${field} must be a string`)
        .trim();

export const registerValidator = [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').trim().notEmpty().withMessage('Phone number is required').matches(/^[+]?[-()\s0-9]{7,20}$/).withMessage('Please provide a valid phone number'),
    optionalTrimmedString('company'),
    optionalTrimmedString('companyName'),
    optionalTrimmedString('invoiceName'),
    optionalTrimmedString('invoiceVat'),
    optionalTrimmedString('invoiceAddress'),
    body('verificationChannel').optional().isIn(['sms', 'email']).withMessage('verificationChannel must be sms or email'),
    body('preferredLanguage').optional().isIn(['en', 'ro']).withMessage('preferredLanguage must be en or ro'),
    body('recaptchaToken').isString().notEmpty().withMessage('reCAPTCHA token is required'),
    body('agreeTerms').isBoolean().withMessage('agreeTerms must be a boolean').custom((value) => value === true).withMessage('Terms acceptance is required'),
    body('newsletter').optional().isBoolean().withMessage('newsletter must be a boolean'),
    body('cookiesAccepted').optional().isBoolean().withMessage('cookiesAccepted must be a boolean'),
    validate
];

export const loginValidator = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

export const updateMeValidator = [
    body('fullName').optional({ values: 'null' }).isString().trim().notEmpty().withMessage('Full name cannot be empty'),
    body('phone').optional({ values: 'null' }).isString().trim().matches(/^[+]?[-()\s0-9]{7,20}$/).withMessage('Please provide a valid phone number'),
    body('companyName').optional({ values: 'null' }).isString().trim(),
    body('invoiceName').optional({ values: 'null' }).isString().trim(),
    body('invoiceVat').optional({ values: 'null' }).isString().trim(),
    body('invoiceAddress').optional({ values: 'null' }).isString().trim(),
    body('newsletterSubscribed').optional().isBoolean().withMessage('newsletterSubscribed must be a boolean'),
    body('preferredLanguage').optional().isIn(['en', 'ro']).withMessage('preferredLanguage must be en or ro'),
    body('preferredVerificationChannel').optional().isIn(['sms', 'email']).withMessage('preferredVerificationChannel must be sms or email'),
    validate
];

export const verifyOtpValidator = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('otpCode').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    validate
];

export const forgotPasswordValidator = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    validate
];

export const resetPasswordValidator = [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
    validate
];

export const resendOtpValidator = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('channel').optional().isIn(['sms', 'email']).withMessage('Channel must be sms or email'),
    validate
];

export const sendVerificationOtpValidator = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('channel').isIn(['sms', 'email']).withMessage('Channel must be sms or email'),
    validate
];

export const newsletterSubscribeValidator = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    validate
];
