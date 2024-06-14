const Store = require('../Model/User-model');
const Product = require('../Model/Product-model');
const Order = require('../Model/Order-model');
const EsewaTransaction = require('../Model/Esewa-model');




const createOrder = async (req, res) => {
    try {
        const {
            fullName,
            phoneNumber,
            email,
            cart,
            price,
            totalPrice,
            deliveryCharge,
            promoCode,
            promoDiscount,
            address,
            landmark,
            paymentMethod,
            esewaTransactionID
        } = req.body;

        // Validate required fields
        if (!fullName || !phoneNumber || !cart || cart.length === 0 || !price || !totalPrice) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate and populate products in the cart
        const populatedCart = await Promise.all(cart.map(async item => {
            const product = await Product.findById(item.product);
            if (!product) {
                throw new Error(`Product with ID ${item.product} not found`);
            }

            // Check for stock availability
            if (item.selectedvariant[0].name === 'default') {
                // Check product inventory
                if (item.count > product.inventory) {
                    throw new Error(`Product with ID ${item.product} is out of stock`);
                }
            } else {
                // Find the variant
                const variant = product.variant.find(v => v.name === item.selectedvariant[0].name);
                if (!variant) {
                    throw new Error(`Variant ${item.selectedvariant[0].name} not found for product with ID ${item.product}`);
                }

                // Find the option
                const option = variant.options.find(o => o.name === item.selectedvariant[0].options.name);
                if (!option) {
                    throw new Error(`Option ${item.selectedvariant[0].options.name} not found in variant ${item.selectedvariant[0].name} for product with ID ${item.product}`);
                }

                // Check option count
                if (item.count > option.count) {
                    throw new Error(`Option ${item.selectedvariant[0].options.name} in variant ${item.selectedvariant[0].name} for product with ID ${item.product} is out of stock`);
                }
            }

            return {
                ...item,
                product: product._id
            };
        }));

        // Validate Esewa transaction if payment method is Esewa
        if (paymentMethod === 'Esewa' && esewaTransactionID) {
            const transaction = await EsewaTransaction.findById(esewaTransactionID);
            if (!transaction) {
                return res.status(400).json({ message: 'Invalid Esewa transaction ID' });
            }
        }

        // Create order document
        const newOrder = new Order({
            fullName,
            phoneNumber,
            email,
            cart: populatedCart,
            price,
            totalPrice,
            deliveryCharge,
            promoCode,
            promoDiscount,
            address,
            landmark,
            paymentMethod,
            esewaTransactionID
        });

        // Save order to the database
        const savedOrder = await newOrder.save();

        // Return the saved order
        return res.status(201).json(savedOrder);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};



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
