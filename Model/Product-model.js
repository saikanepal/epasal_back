const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    variant: [{
        name: {
            type: String,
            required: true
        },
        options: [{
            value: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            image: {
                type: String,
                required: true
            }
        }]
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Add pre-save hook to update the updated_at field
productSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
