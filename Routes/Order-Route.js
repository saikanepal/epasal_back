const express = require('express');
const router = express.Router();
const orderController = require('../Controller/Order-Controller');


//route to create a order
// Route to create a new order for a specific store
router.post('/create/:storeID', orderController.createOrder);

// Route to get all orders for a specific store
router.get('/order/:storeID', orderController.getAllOrders);



// Route to update an existing order
router.patch('/:orderId', orderController.updateOrder);

// Route to delete an existing order
router.delete('/:orderId', orderController.deleteOrder);

module.exports = router;
