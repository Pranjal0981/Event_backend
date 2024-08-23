const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Replace with your actual User model

exports. isAuthenticated = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Login first to access this resource' });
    }

    const token = authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.id = decoded.id; // Set the user ID from the token payload
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ error: 'Invalid token, please login again' });
    }
};

