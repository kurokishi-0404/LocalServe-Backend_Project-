const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Attach user info with both id and _id for compatibility
        req.user = {
            ...decoded,
            _id: decoded.id
        };

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, invalid token'
        });
    }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles - Allowed roles (e.g., 'customer', 'provider', 'admin')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: role '${req.user ? req.user.role : 'guest'}' is not authorized to access this resource`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };