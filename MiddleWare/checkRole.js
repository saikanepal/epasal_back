const User = require('../Model/User-model');

const checkRole = (requiredRole) => {
    return async (req, res, next) => {
        const userID = req.userData.userID;

        try {
            const user = await User.findById(userID);

            if (!user) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            // Define the role hierarchy
            const roleHierarchy = {
                'Owner': 4,
                'Admin': 3,
                'Staff': 2,
                'Delivery': 1
            };

            // Check if the user's role is at least as high as the required role
            if (roleHierarchy[user.role] >= roleHierarchy[requiredRole]) {
                next(); // Allow access
            } else {
                return res.status(403).json({ message: 'Access denied' });
            }

        } catch (error) {
            console.error('Error finding user:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
};

module.exports = checkRole;
