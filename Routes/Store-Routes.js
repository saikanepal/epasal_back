// Require necessary modules
const express = require('express');
const router = express.Router();
const storeController = require('../Controller/Store-Controller');
//middlewares
const checkAuth = require('../MiddleWare/checkAuth');
const checkRole = require('../MiddleWare/checkRole');
const checkBanauRole = require('../MiddleWare/checkBanauRole');
// Define routes


//authentication middleware
router.use(checkAuth);

router.post('/create', storeController.createStore);

router.get('/get/:storeName', storeController.getStore);
router.get('/getStore/:storeName', storeController.getStoreByName);

router.get('/getactiveTheme/:storeID', storeController.getActiveTheme);

router.patch('/update/:id', storeController.updateStore);
router.put('/update/dashboard/:storeID', storeController.updateDashboardStore);
router.put('/update/dashboard/banau/:storeID',checkBanauRole('Admin'),storeController.updateDashboardStore);


router.get('/getstorebyfilter', storeController.getStoreByFilter);
//store delete
router.put('/delete/:storeId', checkRole('owner'), storeController.deleteStore);
// Export the router
module.exports = router; 