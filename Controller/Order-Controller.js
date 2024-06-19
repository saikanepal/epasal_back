const Store = require('../Model/Store-model');
const Product = require('../Model/Product-model');
const Order = require('../Model/Order-model');
const EsewaTransaction = require('../Model/Esewa-model');
const mongoose = require('mongoose');
const { response } = require('express');




const createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const {
                fullName,
                phoneNumber,
                email,
                cart,
                status, // Assuming status is coming from req.body but not explicitly used in your example
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

            console.log('Received Order Request:', req.body);

            const storeID = req.params.storeID;
            console.log('Store ID:', storeID);

            // Validate required fields
            if (!fullName || !phoneNumber || !cart || cart.length === 0 || !price || !totalPrice) {
                throw new Error('Missing required fields');
            }

            // Validate and populate products in the cart
            const populatedCart = await Promise.all(cart.map(async item => {
                const product = await Product.findById(item.product).session(session);
                if (!product) {
                    throw new Error(`Product with ID ${item.product} not found`);
                }

                // Check for stock availability
                if (!item.selectedVariant || item.selectedVariant.length === 0 || item.selectedVariant[0].name === 'default') {
                    // Default variant scenario
                    if (item.count > product.inventory) {
                        throw new Error(`Product with ID ${item.product} is out of stock`);
                    }
                } else {
                    // Non-default variant scenario
                    const variant = product.variant.find(v => v.name === item.selectedVariant[0].name);
                    if (!variant) {
                        throw new Error(`Variant ${item.selectedVariant[0].name} not found for product with ID ${item.product}`);
                    }

                    const option = variant.options.find(o => o.name === item.selectedVariant[0].options.name);
                    if (!option) {
                        throw new Error(`Option ${item.selectedVariant[0].options.name} not found in variant ${item.selectedVariant[0].name} for product with ID ${item.product}`);
                    }

                    if (item.count > option.count) {
                        throw new Error(`Option ${item.selectedVariant[0].options.name} in variant ${item.selectedVariant[0].name} for product with ID ${item.product} is out of stock`);
                    }
                }

                return {
                    ...item,
                    product: product._id
                };
            }));

            // Validate Esewa transaction if payment method is Esewa
            if (paymentMethod === 'Esewa' && esewaTransactionID) {
                const transaction = await EsewaTransaction.findById(esewaTransactionID).session(session);
                if (!transaction) {
                    throw new Error('Invalid Esewa transaction ID');
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

            console.log('Creating New Order:', newOrder);

            // Save order to the database
            const savedOrder = await newOrder.save({ session });
            console.log('Saved Order:', savedOrder);

            // Add the order to the store's orders array
            const store = await Store.findById(storeID).session(session);
            if (!store) {
                throw new Error(`Store with ID ${storeID} not found`);
            }
            store.orders.push(savedOrder._id);
            await store.save({ session });

            console.log(`Order ${savedOrder._id} added to Store ${storeID} orders`);

            // Update stock counts
            await Promise.all(cart.map(async item => {
                const product = await Product.findById(item.product).session(session);
                if (!product) {
                    throw new Error(`Product with ID ${item.product} not found`);
                }

                if (!item.selectedVariant || item.selectedVariant.length === 0 || item.selectedVariant[0].name === 'default') {
                    // Default variant scenario
                    product.inventory -= item.count;
                } else {
                    // Non-default variant scenario
                    const variant = product.variant.find(v => v.name === item.selectedVariant[0].name);
                    const option = variant.options.find(o => o.name === item.selectedVariant[0].options.name);
                    option.count -= item.count;
                }

                await product.save({ session });
                console.log(`Updated inventory for Product ${product._id}`);
            }));

            // Return the saved order
            res.status(201).json(savedOrder);
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    } finally {
        session.endSession();
    }
};





const getOrdersByStore = async (req, res) => {
    const { storeID } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.search || '';
    const skip = (page - 1) * limit;

    console.log('Store ID:', storeID);
    console.log('Page:', page, 'Limit:', limit, 'Search Term:', searchTerm);

    try {
        // Initialize search conditions
        const searchConditions = [];

        // Split search terms by comma and trim spaces
        const searchTerms = searchTerm.split(',').map(term => term.trim());

        // Only add search conditions if search terms are provided
        if (searchTerms.length > 0) {
            searchTerms.forEach(term => {
                const termConditions = [
                    { fullName: { $regex: term, $options: 'i' } },
                    { address: { $regex: term, $options: 'i' } },
                    { landmark: { $regex: term, $options: 'i' } },
                    { email: { $regex: term, $options: 'i' } },
                    { phoneNumber: { $regex: term, $options: 'i' } },
                    { 'cart.productName': { $regex: term, $options: 'i' } },
                    { status: { $regex: term, $options: 'i' } }
                ];

                if (mongoose.Types.ObjectId.isValid(term)) {
                    termConditions.push({ _id: term });
                }

                searchConditions.push({ $or: termConditions });
            });
        }

        // Populate orders with or without search conditions
        const store = await Store.findById(storeID)
            .populate({
                path: 'orders',
                match: searchConditions.length ? { $and: searchConditions } : {},
                options: {
                    skip,
                    limit,
                    select: '-deliveryCode', // Exclude deliveryCode
                },
                populate: {
                    path: 'cart.product',
                    model: 'Product'
                }
            });

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Calculate total orders with or without search conditions
        const totalOrders = await Order.countDocuments({
            store: storeID,
            ...(searchConditions.length ? { $and: searchConditions } : {})
        });

        res.json({
            orders: store.orders,
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders
        });
    } catch (error) {
        console.error('Error fetching orders:', error.message);
        res.status(500).json({ message: 'Fetching orders failed, please try again later.', error: error.message });
    }
};


const updateOrder = async (req, res) => {
    const { orderId, storeID } = req.params;
    const { status, deliveryCode } = req.body;
    console.log(req.params);
    console.log(req.body);
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate if orderId is valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        // Fetch the order to check the deliveryCode within the transaction
        const order = await Order.findById(orderId).session(session);
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if order is already delivered
        if (order.status === 'Delivered') {
            await session.abortTransaction();
            return res.status(403).json({ message: "Delivered Order can no longer be updated" });
        }

        // If status is "Delivered", check the deliveryCode
        if (status === 'Delivered') {
            console.log(order);
            if (!deliveryCode || deliveryCode.toLowerCase() !== order.deliveryCode.toLowerCase()) {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Invalid delivery code' });
            }
        }

        // Prepare the update object excluding deliveryCode unless explicitly provided
        const updateData = { status };
        if (deliveryCode) {
            updateData.deliveryCode = deliveryCode;
        }

        // Update the order status
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            updateData,
            { new: true, session }
        );

        // Update store dueAmount only for COD orders within the transaction
        if (order.paymentMethod === 'CashOnDelivery' && status === 'Delivered') {
            const store = await Store.findById(storeID).session(session);
            if (!store) {
                await session.abortTransaction();
                return res.status(404).json({ message: "Store not found" });
            }

            const dueAmountIncrease = 0.03 * order.totalPrice;
            store.dueAmount += dueAmountIncrease;
            store.revenueGenerated += order.totalPrice-dueAmountIncrease;
            await store.save({ session });
        }

        await session.commitTransaction();
        res.json({ message: 'Order updated successfully', updatedOrder });
    } catch (error) {
        console.error('Error updating order:', error.message);
        await session.abortTransaction();
        res.status(500).json({ message: 'Failed to update order', error: error.message });
    } finally {
        session.endSession();
    }
};




module.exports = { createOrder, getOrdersByStore, updateOrder };



