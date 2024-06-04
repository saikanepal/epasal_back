const mongoose = require('mongoose');
const Review = require('./Review-Model');
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
    // need to deal with price oncce variant is introduced 
    price: {
        type: Number
    },
    image: {
        imageUrl: { type: String },
        imageID: { type: String }
    },
    //discount field 
    priceVariant: {
        type: String, 
    },
    image: {
        imageId:{type:String,required:true},
        imageUrl:{type:String,required:true}
    },
    variant: [{
        name: {
            type: String,
            required: true
        },
        options: [{
            name: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true
            },
            image: {
                imageId: { type: String },
                imageUrl: { type: String },
            },
            discount: {
                type: Number,
                default: 0
            }
        }]
    }],
    //analytics

    //todo make another model for this 
    soldQuantity: {
        type: Number,
        default:0
    },
    revenueGenerated: {
        type: Number,
        default:0
    },
    inventory: {
        type: Number,
        default:1
    },// total amount of stocks of quantity 
    review: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    discount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });



const Product = mongoose.model('Product', productSchema);

module.exports = Product;
