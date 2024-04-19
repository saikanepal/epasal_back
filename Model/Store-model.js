const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    logo: { type: String, required: true },
    categories: [{ name: { type: String, required: true } }],
    subCategories: [{ name: { type: String, required: true } }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Reference to Product model
    color: { type: Object }, // You can adjust this based on your requirements
    secondaryBanner: { type: String },
    previewMode: { type: Boolean, default: true },
    socialMediaLinks: {
        facebook: { type: String },
        twitter: { type: String },
        instagram: { type: String },
        linkedin: { type: String }
    },
    footerDescription: { type: String }
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
