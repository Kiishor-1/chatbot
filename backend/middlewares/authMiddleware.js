const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized: No token provided'
        });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        if (res.headersSent) return;

        console.error('JWT error:', error.message);
        const message = error.name === 'TokenExpiredError'
            ? 'Session expired, please log in again'
            : 'Unauthorized: Invalid token';

        return res.status(401).json({
            success: false,
            error: message
        });
    }

    try {
        const user = await User.findOne({email:decoded.email});
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Invalid token'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error in auth middleware:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

module.exports = authMiddleware;