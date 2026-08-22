import jwt from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse.js';
import User from '../../models/User.js';

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['passwordHash'] }
            });

            if (!req.user) {
                return sendError(res, 401, 'Not authorized, user not found');
            }
            if (req.user.isActive === false) {
                return sendError(res, 403, 'This account has been deactivated. Please contact an administrator.');
            }

            // Check if token was issued before the last logout
            if (req.user.lastLogoutAt && decoded.iat * 1000 < req.user.lastLogoutAt.getTime()) {
                return sendError(res, 401, 'Session expired, please login again');
            }

            next();
        } catch (error) {
            console.error(error);
            return sendError(res, 401, 'Not authorized, token failed');
        }
    }

    if (!token) {
        return sendError(res, 401, 'Not authorized, no token');
    }
};

export default protect;
