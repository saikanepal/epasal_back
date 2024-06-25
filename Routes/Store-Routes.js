// Require necessary modules
const express = require('express');
const router = express.Router();
const storeController = require('../Controller/Store-Controller');
//middlewares
const checkAuth = require('../MiddleWare/checkAuth');
const checkRole = require('../MiddleWare/checkRole');
// Define routes


//authentication middleware
router.use(checkAuth);

router.post('/create', storeController.createStore);

router.get('/get/:storeName', storeController.getStore);
router.get('/getStore/:storeName', storeController.getStoreByName);

router.get('/getactiveTheme/:storeID', storeController.getActiveTheme);

router.patch('/update/:id', storeController.updateStore);
router.put('/update/dashboard/:storeID', storeController.updateDashboardStore);
router.patch('/upgrade/storeSubscription/:transactionID', storeController.updateSubscription);
router.patch('/upgrade/storeSkin/:transactionID', storeController.updateSkin);
router.get('/get/graph/sales',storeController.getStoreStats);
//store delete
router.put('/delete/:storeId', checkRole('owner'), storeController.deleteStore);
// Export the router
module.exports = router; 