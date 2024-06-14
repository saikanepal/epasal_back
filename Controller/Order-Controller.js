const Store = require('../Model/User-model');
const Order = require('../Model/Order-model');
const EsewaTransaction = require('../Model/Esewa-model');



//creating a order
const createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

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

        const { storeID } = req.params;

        // Validate the store
        const store = await Store.findById(storeID).session(session);
        if (!store) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: `Store with ID ${storeID} not found` });
        }

        // Validate cart items
        for (const item of cart) {
            const product = await Product.findById(item.product).session(session);
            if (!product) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ error: `Product with ID ${item.product} not found` });
            }

            if (item.selectedvariant && item.selectedvariant.length > 0) {
                const firstVariant = item.selectedvariant[0];

                if (firstVariant.name === 'default') {
                    // Check if the product inventory is still available
                    if (product.inventory < item.count) {
                        await session.abortTransaction();
                        session.endSession();
                        return res.status(400).json({ error: `Product with ID ${item.product} is out of stock` });
                    }
                } else {
                    // Check the product's first variant for count
                    const productVariant = product.variants.find(variant => variant.name === firstVariant.name);
                    if (!productVariant || productVariant.count < item.count) {
                        await session.abortTransaction();
                        session.endSession();
                        return res.status(400).json({ error: `Variant ${firstVariant.name} of product with ID ${item.product} is out of stock` });
                    }
                }
            }
        }

        // Validate EsewaTransaction if payment method is Esewa
        if (paymentMethod === 'Esewa' && esewaTransactionID) {
            const esewaTransaction = await EsewaTransaction.findById(esewaTransactionID).session(session);
            if (!esewaTransaction) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ error: `EsewaTransaction with ID ${esewaTransactionID} not found` });
            }
        }

        const newOrder = new Order({
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
            esewaTransactionID,
            store: storeID // Associate the order with the store
        });

        const savedOrder = await newOrder.save({ session });

        // Add the order to the store
        store.orders.push(savedOrder._id);
        await store.save({ session });

        // Update product inventory
        for (const item of cart) {
            const product = await Product.findById(item.product).session(session);

            if (item.selectedvariant && item.selectedvariant.length > 0) {
                const firstVariant = item.selectedvariant[0];

                if (firstVariant.name === 'default') {
                    // Reduce the product inventory
                    product.inventory -= item.count;
                } else {
                    // Reduce the count of the product's first variant
                    const productVariant = product.variants.find(variant => variant.name === firstVariant.name);
                    if (productVariant) {
                        productVariant.count -= item.count;
                    }
                }

                await product.save({ session });
            }
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(savedOrder);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({ error: 'Server error' });
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
