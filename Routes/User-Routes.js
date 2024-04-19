// Require necessary modules
const express = require('express');
const router = express.Router();
const userController = require('../Controller/User-Controller');
const checkAuth = require('../MiddleWare/checkAuth');
// Define routes

// Route for user signup
router.post('/signup', userController.signUp);

// Route for user signin
router.post('/signin', userController.signIn);
router.post('/verify', userController.verifyUser);

router.use(checkAuth);
// Export the router
module.exports = router;