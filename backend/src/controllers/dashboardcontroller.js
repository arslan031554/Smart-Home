import * as dashboardService from '../services/dashboardservice.js';
import { sendResponse, sendError } from '../utils/apiResponse.js';

/**
 * GET /api/dashboard
 * Returns dashboard data for the authenticated user only.
 */
export const getDashboard = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) return sendError(res, 401, 'Not authenticated');

        const userSummary = {
            id: req.user.id,
            fullName: req.user.fullName || req.user.email,
            email: req.user.email,
            role: req.user.role || 'customer'
        };

        const data = await dashboardService.getDashboard(userId, userSummary);
        sendResponse(res, 200, true, 'Dashboard data', data);
    } catch (error) {
        next(error);
    }
};
