const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    categories: [{ type: String, required: true }],
    subcategories: [{ type: String, required: true }],
    sizes: [{ type: String }],
    variants: [{
        type: {
            type: String,
            enum: ['Color', 'Size'], // Example variant types
            required: true
        },
        option: { type: String, required: true },
        prices: [{ type: Number, required: true }]
    }]
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
