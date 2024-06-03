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
    // need to deal with price oncce variant is introduced 
    price: {
        type: Number
    },

    //discount field 
    discountCap: {
        type: String, // higher or lower discount 
    },
    variant: [{
        name: {
            type: String,
            required: true
        },
        options: [{
            value: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true
            },
            image: {
                imageId: {type:String},
                imageUrl: {type:String},
            },
            discount: {
                type: Number,
                default: 0
            }
        }]
    }],
    //analytics
    soldQuantity: {
        type: Number
    },
    revenueGenerated: {
        type: Number
    },
    inventory: {
        type: Number
    },// total amount of stocks of quantity 
    review: {
        type: Number
    },
    discount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });



const Product = mongoose.model('Product', productSchema);

module.exports = Product;
