const mongoose = require('mongoose');

const esewaTransactionSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
    },
    transaction_code: String,
    payment_method: {
        type: String,
        required: true,
        default: "esewa",
    },
    signature: {
        type: String,
        required: true,
    },
    transaction_code: {
        type: String,
        required: true,
    },
    total_amount: {
        type: Number,
        required: true,
    },
    transaction_uuid: {
        type: String,
        required: true,
    },
    product_code: {
        type: String,
        required: true,
    },
    success_url: {
        type: String,
        required: true,
    },
    signed_field_names: {
        type: String,
        required: true,
    },
    //transaction ID = orderID = refrence to Order Model
    orderID: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
}, {
    timestamps: true
});

const EsewaTransaction = mongoose.model('EsewaTransaction', esewaTransactionSchema);

module.exports = EsewaTransaction;
