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
    stores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }], // Array of references to Store model for stores
    activeTheme: {
        type: String,
        default: 1
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
