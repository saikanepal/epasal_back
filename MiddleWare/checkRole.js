const User = require('../Model/User-model');

const checkRole = (requiredRole) => {
    return async (req, res, next) => {
        const userID = req.userData.userID;

        try {
            const user = await User.findById(userID);

            if (!user) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            if (user.role !== requiredRole) {
                return res.status(403).json({ message: 'Access denied' });
            }

            next();

        } catch (error) {
            console.error('Error finding user:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
};

module.exports = checkRole;
