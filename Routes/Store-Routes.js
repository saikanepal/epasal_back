// Require necessary modules
const express = require('express');
const router = express.Router();
const checkAuth = require('../MiddleWare/checkAuth');
const storeController = require('../Controller/Store-Controller');
// Define routes


//authentication middleware
// router.use(checkAuth);  

router.post('/create', storeController.createStore);

router.get('/get/:storeId', storeController.getStore);
router.get('/getactiveTheme/:storeID', storeController.getActiveTheme);

router.patch('/update/:id',storeController.updateStore);
// Export the router
module.exports = router; 