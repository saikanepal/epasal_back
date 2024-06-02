const mongoose = require('mongoose');
const User = require('./User-model');
const Product = require('./Product-model');
const storeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    logo: { type: String, required: true },
    location: { type: String }, // Location of the store
    phoneNumber: { type: String, required: true }, // Phone number of the store
    emailAddress: { type: String, required: true }, // Email address of the store
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
    footerDescription: { type: String },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model for admin
    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of references to User model for staff
    subscriptionStatus: { type: String, default: 'Silver' },// Subscription status field with default value 'Active'
    activeTheme: { type: Number, default: '1' },
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
