const mongoose = require('mongoose');
const Store = require('../Model/Store-model');
const esewaTransactionSchema = new mongoose.Schema(
    {
        payment_method: {
            type: String,
            required: true,
            default: "esewa",
        },
        transaction_code: String,
        amount: {
            type: Number,
            required: true,
        },
        subscription: {
            type: String,
            default: 'Silver'
        },
        store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
        status: {
            type: String,
            required: true,
            enum: ["created", "paid", "shipping", "delivered"],
            default: "created",
        },
        address: String,
    },
    {
        timestamps: true,
    }
);

const EsewaTransaction = mongoose.model('EsewaTransaction', esewaTransactionSchema);

module.exports = EsewaTransaction;
