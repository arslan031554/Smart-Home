import { Router } from 'express';
import * as authController from '../controllers/authcontroller.js';
import protect from '../middlewares/authmiddleware.js';
import {
    registerValidator,
    loginValidator,
    updateMeValidator,
    newsletterSubscribeValidator,
    verifyOtpValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    resendOtpValidator,
    sendVerificationOtpValidator
} from '../validators/authvalidator.js';

const router = Router();

router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);
router.post('/send-verification-otp', sendVerificationOtpValidator, authController.sendVerificationOtp);
router.post('/verify-otp', verifyOtpValidator, authController.verifyOtp);
router.post('/resend-otp', resendOtpValidator, authController.resendOtp);
router.post('/forgot-password', forgotPasswordValidator, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, authController.resetPassword);
router.post('/newsletter-subscribe', newsletterSubscribeValidator, authController.newsletterSubscribe);
router.get('/me', protect, authController.getMe);
router.put('/me', protect, updateMeValidator, authController.updateMe);
router.post('/logout', protect, authController.logout);

export default router;
