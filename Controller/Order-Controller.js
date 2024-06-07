const Store = require('../Model/User-model');
const Order = require('../Model/Order-model');
const EsewaTransaction = require('../Model/Esewa-model');

// Get all orders for a specific store
const getAllOrders = async (req, res) => {
    try {
        const storeId = req.params.storeId;

        // Find the store by ID
        const store = await Store.findById(storeId).populate({
            path: 'order',
            populate: { path: 'products' }
        });

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Return all orders associated with the store
        res.status(200).json(store.order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Create a new order for a specific store
const createOrder = async (req, res) => {
    try {

        const { storeId } = req.params;
        const { orderDetails, esewaTransactionDetails } = req.body;

        // Find the store by ID
        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Create the EsewaTransaction
        const esewaTransaction = new EsewaTransaction(esewaTransactionDetails);
        await esewaTransaction.save();

        // Create the order
        const order = new Order({ ...orderDetails, esewaTransactionID: esewaTransaction._id });
        await order.save();

        // Update the store with the new order
        store.order.push(order._id);
        await store.save();
        res.status(201).json({ message: 'Order created successfully', order });

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: error.message });

    }
};

// Update an existing order
const updateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const updates = req.body;

        // Find the order by ID and update it
        const updatedOrder = await Order.findByIdAndUpdate(orderId, updates, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order updated successfully', updatedOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Delete an order
// Delete an order
const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find the order by ID
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Delete the associated EsewaTransaction, if it exists
        if (order.esewaTransactionID) {
            await EsewaTransaction.findByIdAndDelete(order.esewaTransactionID);
        }

        // Delete the order
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Remove the order ID from the associated store
        const store = await Store.findOneAndUpdate({ order: orderId }, { $pull: { order: orderId } });
        if (!store) {
            console.error('Failed to update store with the deleted order');
        }

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


module.exports = { getAllOrders, createOrder, updateOrder, deleteOrder };
