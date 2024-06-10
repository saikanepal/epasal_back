// Require necessary modules
const express = require('express');
const router = express.Router();
const storeController = require('../Controller/Store-Controller');
//middlewares
const checkAuth = require('../MiddleWare/checkAuth');
const checkRole = require('../MiddleWare/checkRole');
// Define routes


//authentication middleware
// router.use(checkAuth);  

router.post('/create', storeController.createStore);

router.get('/get/:storeId', storeController.getStore);
router.get('/getStore/:storeName', storeController.getStoreByName);

router.get('/getactiveTheme/:storeID', storeController.getActiveTheme);

router.patch('/update/:id', storeController.updateStore);

//store delete
router.put('/delete/:storeId', checkAuth, checkRole('owner'), storeController.deleteStore);
// Export the router
module.exports = router; 