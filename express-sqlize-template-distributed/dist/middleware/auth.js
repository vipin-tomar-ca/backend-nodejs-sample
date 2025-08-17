"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.requireAdmin = exports.requireRole = exports.authMiddleware = void 0;
const types_1 = require("../types");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new types_1.UnauthorizedError('No token provided');
        }
        const token = authHeader.substring(7);
        if (!isValidToken(token)) {
            throw new types_1.UnauthorizedError('Invalid token');
        }
        const user = decodeUserFromToken(token);
        if (!user) {
            throw new types_1.UnauthorizedError('Invalid user');
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof types_1.UnauthorizedError) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: error.message,
                timestamp: new Date(),
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: 'Authentication failed',
                timestamp: new Date(),
            });
        }
    }
};
exports.authMiddleware = authMiddleware;
const requireRole = (roles) => {
    return (req, res, next) => {
        try {
            const authenticatedReq = req;
            if (!authenticatedReq.user) {
                throw new types_1.UnauthorizedError('User not authenticated');
            }
            if (!roles.includes(authenticatedReq.user.role)) {
                res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Insufficient permissions',
                    timestamp: new Date(),
                });
                return;
            }
            next();
        }
        catch (error) {
            if (error instanceof types_1.UnauthorizedError) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: error.message,
                    timestamp: new Date(),
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Authorization failed',
                    timestamp: new Date(),
                });
            }
        }
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)(['admin']);
const requirePermission = (permission) => {
    return (req, res, next) => {
        try {
            const authenticatedReq = req;
            if (!authenticatedReq.user) {
                throw new types_1.UnauthorizedError('User not authenticated');
            }
            if (!authenticatedReq.user.permissions.includes(permission)) {
                res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: `Permission '${permission}' required`,
                    timestamp: new Date(),
                });
                return;
            }
            next();
        }
        catch (error) {
            if (error instanceof types_1.UnauthorizedError) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: error.message,
                    timestamp: new Date(),
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Internal Server Error',
                    message: 'Permission check failed',
                    timestamp: new Date(),
                });
            }
        }
    };
};
exports.requirePermission = requirePermission;
function isValidToken(token) {
    return token.length > 10 && token.includes('user');
}
function decodeUserFromToken(token) {
    try {
        if (token.includes('admin')) {
            return {
                id: 1,
                email: 'admin@example.com',
                role: 'admin',
                permissions: ['read', 'write', 'delete', 'admin'],
            };
        }
        else if (token.includes('user')) {
            return {
                id: 2,
                email: 'user@example.com',
                role: 'user',
                permissions: ['read', 'write'],
            };
        }
        return null;
    }
    catch (error) {
        return null;
    }
}
//# sourceMappingURL=auth.js.map