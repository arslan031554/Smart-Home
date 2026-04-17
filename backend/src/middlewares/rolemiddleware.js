import { sendError } from '../utils/apiResponse.js';
import { hasAdminPanelAccess, hasAdminPermission } from '../constants/adminpermissions.js';

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return sendError(res, 403, `User role ${req.user.role} is not authorized to access this route`);
        }
        if ((req.user.role === 'admin' || req.user.role === 'employee') && !hasAdminPanelAccess(req.user)) {
            return sendError(res, 403, 'User is not authorized to access the admin panel');
        }
        next();
    };
};

export const requireAdminPermission = (...permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, 401, 'Not authorized, user not found');
        }
        if (!['admin', 'employee'].includes(req.user.role)) {
            return sendError(res, 403, 'User is not authorized to access the admin panel');
        }
        if (!hasAdminPanelAccess(req.user)) {
            return sendError(res, 403, 'User is not authorized to access the admin panel');
        }
        if (!permissions.length) {
            return next();
        }

        const isAllowed = permissions.some((permission) => hasAdminPermission(req.user, permission));
        if (!isAllowed) {
            return sendError(res, 403, 'User is not authorized to perform this action');
        }

        next();
    };
};

export default authorize;
