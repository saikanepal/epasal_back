const mongoose = require('mongoose');
const User = require('./User-model');
const Product = require('./Product-model');


const storeSchema = new mongoose.Schema({
    name: { type: String, required: true }, //TODO : INDEX  
    //!index is not done yet
    // * filter
    logo: {
        logoUrl: {
            type: String
        },
        logoID: {
            type: String
        }
    },
    phoneNumber: { type: String }, // Phone number of the store // * filter
    email: { type: String }, // Email address of the store // * filter
    categories: [{ name: { type: String, required: true } }],
    subCategories: [{ name: { type: String, required: true } }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Reference to Product model,
    featuredProducts: [{ type: Number }],
    color: { type: Object }, // You can adjust this based on your requirements
    banner: {
        bannerUrl: {
            type: String
        },
        bannerID: {
            type: String
        }
    },
    secondaryBanner: {
        secondaryBannerUrl: { type: String },
        secondaryBannerID: { type: String },
    },
    thirdBanner: {
        thirdBannerUrl: { type: String },
        thirdBannerID: { type: String },
    },
    //location 
    location: {
        type: String
    }, // Location of the store
    address: { type: String },// * filter

    previewMode: { type: Boolean, default: true },
    //footer details
    socialMediaLinks: {
        facebook: { type: String },
        twitter: { type: String },
        instagram: { type: String },
        linkedin: { type: String }
    },
    //order and analytics
    revenueGenerated: { type: Number, default: 0 },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    customers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    dueAmount: { type: Number, default: 0, index: true },// * filter ascending or desceding 
    pendingAmount: { type: Number, default: 0, index: true },// * filter ascending or descending
    mostSoldItem: { type: Number },
    visitors: { type: Number, default: 0 }, // todo : Restrict (react-cookie check?) = > rate limiter express?
    conversitionRate: { type: Number, default: 0 },  // order / visitors * 100 %

    // productSold: [{
    //     product: {
    //         type: mongoose.Schema.Types.ObjectId, ref: Product
    //     },
    //     soldQuantity: { type: Number }
    // }],
    // 1st oder : if (phoneN in Retention ? : false => phoneNumber in order :false =>  )
    // retentionRate: [{
    //     orderInfo: [{
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'Order'
    //     }],
    //     timestamp: {
    //         type: Date,
    //         default: Date.now
    //     },
    //     count: {
    //         type: Number
    //     }
    // }],
    // 
    footerDescription: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model for admin// * filter
    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of references to User model for staff // * filter
    subscriptionStatus: { type: String, default: 'Silver' },// Subscription status field with default value 'Active'
    activeTheme: { type: Number, default: '1' },
    componentTheme: { type: Object },  //Navbar : 1 
    secondaryBannerText: {
        heading: { type: String, default: "" },
        paragraph: { type: String, default: "" }
    },
    thirdBannerText: {
        heading: { type: String, default: "" },
        paragraph: { type: String, default: "" }
    },
    offerBanner: {
        offerBannerUrl: {
            type: String
        },
        offerBannerID: {
            type: String
        }
    },
    offerBannerText: {
        para1: { type: String, default: "" },
        para2: { type: String, default: "" },
        para3: { type: String, default: "" }
    },
    //promoCode : may need to restrict in controller

    esewa: {
        accountNumber: { type: String },
        qr: {
            imageUrl: { type: String },
            imageID: { type: String },
        }
    },

    bank: {
        accountNumber: { type: String },
        fullname: { type: String },
        qr: {
            imageUrl: { type: String },
            imageID: { type: String },
        }
    },

    khalti: {
        accountNumber: { type: String },
        qr: {
            imageUrl: { type: String },
            imageID: { type: String },
        }
    },

    promoCode: [
        {
            name: {
                type: String
            },
            value: {
                type: Number,
                default: 0
            },
            // expireDate : ' certain date' , after this date user recieves expired warning 
        }
    ],
    fonts: {
        type: Object
    }
}, { timestamps: true });

// Pre-remove hook to handle cleanup of related orders and products before a Store document is removed
storeSchema.pre('remove', async function (next) {
    try {
        // Delete all Order documents where the _id is in the orders array of the Store document being removed
        await Order.deleteMany({ _id: { $in: this.orders } });

        // Delete all Product documents where the _id is in the products array of the Store document being removed
        await Product.deleteMany({ _id: { $in: this.products } });

        // Proceed to the next middleware or the actual removal of the Store document
        next();
    } catch (err) {
        // Pass any errors to the next middleware
        next(err);
    }
});

const Store = mongoose.model('Store', storeSchema);
module.exports = Store;
