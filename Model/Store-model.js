const mongoose = require('mongoose');
const User = require('./User-model');
const Product = require('./Product-model');
const Order = require('./Order-model'); // Ensure to require the Order model if it's used in the pre-remove hook
const esewaTransactionSchema = require('./Esewa-model');

const storeSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true }, // Indexed field
    logo: {
        logoUrl: { type: String },
        logoID: { type: String }
    },
    phoneNumber: { type: String },
    email: { type: String },
    categories: [{ name: { type: String, required: true } }],
    subCategories: [{ name: { type: String, required: true } }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    featuredProducts: [{ type: Number }],
    color: { type: Object },
    banner: {
        bannerUrl: { type: String },
        bannerID: { type: String }
    },
    secondaryBanner: {
        secondaryBannerUrl: { type: String },
        secondaryBannerID: { type: String }
    },
    thirdBanner: {
        thirdBannerUrl: { type: String },
        thirdBannerID: { type: String }
    },
    location: { type: String },
    address: { type: String },
    previewMode: { type: Boolean, default: true },
    socialMediaLinks: {
        facebook: { type: String },
        twitter: { type: String },
        instagram: { type: String },
        linkedin: { type: String }
    },


    componentSkin: {
        type: [
            {
                component: { type: String },
                skinType: { type: String },
                activeSkin: { type: String },
                skinInventory: [{ type: String, unique: true }],
            }
        ],
        default: [
            {
                component: "Navbar",
                skinType: "Navbar",
                activeSkin: "default",
                skinInventory: ["default"]
            },
            {
                component: "Product1",
                skinType: "Card",
                activeSkin: "default",
                skinInventory: ["default"]
            },
            {
                component: "Product2",
                skinType: "Card",
                activeSkin: "default",
                skinInventory: ["default"]
            },
            {
                component: "Product3",
                skinType: "Card",
                activeSkin: "default",
                skinInventory: ["default"]
            },
            {
                component: "Banner1",
                skinType: "Banner",
                activeSkin: "default",
                skinInventory: ["default"]
            },
            {
                component: "Banner2",
                skinType: "Banner",
                activeSkin: "default",
                skinInventory: ["default"]
            },
            {
                component: "Banner3",
                skinType: "Banner",
                activeSkin: "default",
                skinInventory: ["default"]
            },
            {
                component: "Footer",
                skinType: "Footer",
                activeSkin: "default",
                skinInventory: ["default"]
            },
            {
                component: "Background",
                skinType: "Background",
                activeSkin: "default",
                skinInventory: ["default"]
            }
        ]
    },
    inventory: { type: Number, default: 0 },
    revenueGenerated: { type: Number, default: 0 },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'esewaTransactionSchema' }], // subscrition / skin // 
    customers: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    mostSoldItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    visitors: { type: Number, default: 0 },
    conversitionRate: { type: Number, default: 0 },
    footerDescription: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    subscriptionStatus: {
        type: String,
        enum: ['Silver', 'Gold', 'Platinum'],
        default: 'Silver'
    },
    logs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Logs' }],
    subscriptionExpiry: {
        type: Date,
        default: () => new Date().setFullYear(new Date().getFullYear() + 1)  // Default to one year from current date
    },

    activeTheme: { type: Number, default: 1 },
    secondaryBannerText: {
        heading: { type: String, default: "" },
        paragraph: { type: String, default: "" }
    },
    thirdBannerText: {
        heading: { type: String, default: "" },
        paragraph: { type: String, default: "" }
    },
    offerBanner: {
        offerBannerUrl: { type: String },
        offerBannerID: { type: String }
    },
    offerBannerText: {
        para1: { type: String, default: "" },
        para2: { type: String, default: "" },
        para3: { type: String, default: "" }
    },
    esewa: {
        accountNumber: { type: String, default: "" },
        qr: {
            imageUrl: { type: String, default: "" },
            imageID: { type: String, default: "" }
        }
    },
    bank: {
        accountNumber: { type: String, default: "" },
        fullname: { type: String, default: "" },
        qr: {
            imageUrl: { type: String, default: "" },
            imageID: { type: String, default: "" }
        }
    },
    khalti: {
        accountNumber: { type: String, default: "" },
        qr: {
            imageUrl: { type: String, default: "" },
            imageID: { type: String, default: "" }
        }
    },
    promoCode: [
        {
            name: { type: String },
            value: { type: Number, default: 0 }
        }
    ],
    fonts: { type: Object },
    expectedDeliveryTime: { type: String, default: '3 to 4 business days' },
    expectedDeliveryPrice: { type: Number, default: 100 },
    liveChatSource: { type: String, default: '' },
}, { timestamps: true });

storeSchema.pre('remove', async function (next) {
    try {
        await Order.deleteMany({ _id: { $in: this.orders } });
        await Product.deleteMany({ _id: { $in: this.products } });
        next();
    } catch (err) {
        next(err);
    }
});

const Store = mongoose.model('Store', storeSchema);
module.exports = Store;
