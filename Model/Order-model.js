const mongoose = require('mongoose');
const Product = require('./Product-model');
const EsewaTransaction = require('./Esewa-model');

const orderSchema = new mongoose.Schema({
    
    // Customer details
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, match: /.+\@.+\..+/ },

    // Order status
    status: {
        type: String,
        enum: ['processing', 'delivered', 'cancelled', 'being delivered' , 'refunded'],
        default: 'processing'
    },

    // Product details
    cart: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            price: { type: Number, required: true }, // this should already include count * price
            discountAmount :{type:Number , default:0},
            count: { type: Number, required: true, default: 1 },
            selectedvariant: [{
                name: {
                    type: String,
                    required: true,
                    default:'default'
                },
                options: {
                    name: {
                        type: String,
                        required: true,
                        default:'default'
                    }
                }
            }],
        }
    ],

    // Amount details
    price: { type: Number, required: true }, // total added price ( already discounted)
    totalPrice: { type: Number, required: true }, // after discount + delivery charge - promo discount
    deliveryCharge: { type: Number, default: 0 }, 

    // Promo details
    promoCode: { type: String },
    promoDiscount: { type: Number },

    // Location details
    address: {
        type: String
    },
    landmark: { type: String },

    // Payment details
    paymentMethod: { type: String, default: 'CashOnDelivery' },
    esewaTransactionID: { type: mongoose.Schema.Types.ObjectId, ref: 'EsewaTransaction' },
}, {
    timestamps: true
});

orderSchema.index({ phoneNumber: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
