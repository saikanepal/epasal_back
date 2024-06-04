// Require necessary modules
const express = require('express');
const router = express.Router();
const userController = require('../Controller/User-Controller');

// Middlewares
const checkAuth = require('../MiddleWare/checkAuth');
const checkRole = require('../MiddleWare/checkRole');

// Define routes

// Route for user signup
router.post('/signup', userController.signUp);

// Route for user signin
router.post('/signin', userController.signIn);
router.post('/verify', userController.verifyUser);

// Middleware for checking user authentication (login)
router.use(checkAuth);

// Route with role-based access control
router.put('/update-role', checkAuth, checkRole('Admin'), userController.updateUserRole);

router.get('/admin/dashboard', checkRole('Admin'), (req, res) => {
    res.send('Admin dashboard');
});

// Export the router
module.exports = router;
