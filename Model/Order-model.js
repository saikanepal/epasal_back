const mongoose = require('mongoose');
const Product = require('./Product-model');
const EsewaTransaction = require('./Esewa-model');
const orderSchema = new mongoose.Schema({
    // Customer details
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    // status : processed , delivered , cancelled , being delivered ?
    status: { type: String, required: true, default: 'processing' },
    // product details
    //to do 
    products: [{ type: Object }],
    quantity: { type: Number },
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
    taxAmount: {
        type: Number,
        default: 0
    },

    //promo stuff
    promoCode: {
        type: String,
    },
    promoDiscount: {
        type: Number,
    },

    //location details ;to do

    location: {
        latitude: { type: String },
        longitude: { type: String }
    },
    City: { type: String },
    address: {
        type: String
    },
    landmark: { type: string },

    //payment details
    paymentMethod: {
        type: String,
    },
    //esewa refrence
    esewaTransactionID: { type: mongoose.Schema.Types.ObjectId, ref: 'EsewaTransaction' },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
