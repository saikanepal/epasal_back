const mongoose = require('mongoose');
const Store = require('./Store-model');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    verificationCode: {
        type: String,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    stores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }],
    role: {
        type: String,
        enum: ['Owner', 'Admin', 'Staff', 'Delivery'],
        default: 'Staff'
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
