const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');

const verifyUser = async (req, res, next) => {
    try {
        // Check if Authorization header exists
        if (!req.headers.authorization) {
            return res.status(401).json({ success: false, error: "No authorization header provided" });
        }

        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, error: "Token not provided" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        // Find user
        // const user = await User.findById(decoded._id).select('-password');
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        req.user = user;
        console.log("user verified Success")
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(500).json({ success: false, error: "Authentication failed" });
    }
};

module.exports = { verifyUser };
