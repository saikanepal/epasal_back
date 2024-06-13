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

//routes to get logged in User
router.get('/getLoggedInUser', userController.getLoggedInUser);

// Routes with role-based access control
router.put('/ownerUpdate', checkRole('Owner'), userController.updateUserRoleByOwner);
router.put('/adminUpdate', checkRole('Admin'), userController.updateUserRoleByAdmin);

// Route for adding an employee role to a user
router.post('/addEmployee', checkRole('Owner'), userController.addEmployee);

// Route for deleting an employee role from a user
router.delete('/deleteEmployee', checkRole('Owner'), userController.deleteEmployee);

router.get('/admin/dashboard', checkRole('Admin'), (req, res) => {
    res.send('Admin dashboard');
});

// Export the router
module.exports = router;
