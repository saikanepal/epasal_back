const mongoose = require('mongoose');
const User = require('./User-model');
const Product = require('./Product-model');
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: 'dcrcc9b4h',
    api_key: '638351652727691',
    api_secret: 'pjMWR4xBh2svNScZ_vFg5pyidH0',
});


const storeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    logo: {
        logoUrl: {
            type: String
        },
        logoID: {
            type: String
        }
    },
    phoneNumber: { type: String, required: true }, // Phone number of the store
    emailAddress: { type: String, required: true }, // Email address of the store
    categories: [{ name: { type: String, required: true } }],
    subCategories: [{ name: { type: String, required: true } }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Reference to Product model
    color: { type: Object }, // You can adjust this based on your requirements

    //images 
    logo: { type: String, required: true },
    HeroSection: {
        HeroSectionUrl: {
            type: String
        },
        HeroSectionID: {
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
        latitude: { type: String },
        longitude: { type: String }
    }, // Location of the store
    address: { type: String },

    previewMode: { type: Boolean, default: true },
    //footer details
    socialMediaLinks: {
        facebook: { type: String },
        twitter: { type: String },
        instagram: { type: String },
        linkedin: { type: String }
    },

    //order and analytics
    revenueGenerated: { type: Number },
    order: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    visitors: { type: Number }, // todo : Restrict (react-cookie check?) = > rate limiter express?
    conversitionRate: { type: Number },  // order / visitors * 100 %
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
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model for admin
    staff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of references to User model for staff
    subscriptionStatus: { type: String, default: 'Silver' },// Subscription status field with default value 'Active'
    activeTheme: { type: Number, default: '1' },
    componentTheme: { type: Object },  //Navbar : 1 

    //promoCode : may need to restrict in controller
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
});

const Store = mongoose.model('Store', storeSchema);
module.exports = Store;
