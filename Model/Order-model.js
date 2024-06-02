const mongoose = require('mongoose');
const Product = require('./Product-model');
const EsewaTransaction = require('./Esewa-model');
const orderSchema = new mongoose.Schema({
    // Customer details
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    comments: { type: String },

    // product details
    productID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    quantity: { type: Number },
    selectedVariants: [{
        name: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        }
    }],
    //Amount details
    totalPrice: {
        type: Number,
        required: true
    },
    paidPrice: {
        type: Number,
        required: true
    },
    deliveryCharge: {
        type: Number,
        default: 0
    },
    taxAmount :{
        type:Number,
        default:0
    },
    discountCode: {
        type: String,
    },
    discountAmmount: {
        type: Number,
    },

    //location details
    District: { type: String },
    location: { type: string },
    landmark: { type: string },

    //payment details
    paymentMethod: {
        type: String,
    },
    //esewa refrence
    esewaTransactionID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EsewaTransaction' }],
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
