const Store = require('../Model/Store-model'); // Import the Store model
const Product = require('../Model/Product-model'); // Import the Product model

const createStore = async (req, res) => {
    console.log(req.body);
    console.log("inside store");
    const { name, logo, categories, subCategories, products, color, secondaryBanner, previewMode, selectedSubCategory, cart, socialMediaLinks, footerDescription } = req.body.store;

    try {
        // Create products if products data is provided
        let savedProducts = [];
        if (products && products.length > 0) {
            // Iterate through products and create them
            for (const productData of products) {
                const { name, image, categories, subcategories, sizes, variants } = productData;

                // Create a new product instance
                const newProduct = new Product({
                    name,
                    image,
                    categories,
                    subcategories,
                    sizes,
                    variants
                });

                // Save the product to the database
                const savedProduct = await newProduct.save();
                savedProducts.push(savedProduct);
            }
        }

        // Create a new store instance
        const newStore = new Store({
            name,
            logo,
            categories,
            subCategories,
            products: savedProducts, // Use savedProducts array instead of just products
            color,
            secondaryBanner,
            previewMode,
            selectedSubCategory,
            cart,
            socialMediaLinks,
            footerDescription
        });

        // Save the store to the database
        await newStore.save();

        res.status(201).json({ message: 'Store created successfully', store: newStore });
    } catch (error) {
        console.error('Error creating store:', error);
        res.status(500).json({ message: 'Failed to create store' });
    }
};

const getStore = async (req, res) => {
    console.log("inside getStore", req.params.storeId)
    try {
        // Retrieve store with a maximum limit of 30 products
        const store = await Store.findById(req.params.storeId).populate({
            path: 'products',
            options: { limit: 30 } // Limit the number of populated products to 30
        });

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        res.status(200).json({ message: 'Store retrieved successfully', store });
    } catch (error) {
        console.error('Error retrieving store:', error);
        res.status(500).json({ message: 'Failed to retrieve store' });
    }
};

module.exports = {
    createStore,
    getStore
};
