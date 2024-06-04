const express = require('express');
const router = express.Router();
const orderController = require('../Controller/Order-Controller');

// Route to get all orders for a specific store
router.get('/:storeId/orders', orderController.getAllOrders);

// Route to create a new order for a specific store
router.post('/:storeId/orders', orderController.createOrder);

// Route to update an existing order
router.patch('/:orderId', orderController.updateOrder);

// Route to delete an existing order
router.delete('/:orderId', orderController.deleteOrder);

module.exports = router;
