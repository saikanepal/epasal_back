const Store = require('../Model/Store-model'); // Import the Store model
const Product = require('../Model/Product-model'); // Import the Product model
const User = require('../Model/User-model'); // Import the User model
const createStore = async (req, res) => {
    console.log(req.body);
    console.log(req.userData.userID);
    console.log("inside store");
    const { name, logo, categories, subCategories, products, location, phoneNumber, email, color, secondaryBanner, previewMode, selectedSubCategory, cart, socialMediaLinks, footerDescription } = req.body.store;

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
            location,
            phoneNumber,
            emailAddress: email,
            color,
            secondaryBanner,
            previewMode: true,
            selectedSubCategory,
            cart,
            socialMediaLinks,
            footerDescription,
            admin: req.userData.userID // Set admin as req.userData.userID
        });

        // Save the store to the database
        await newStore.save();

        // Update user document to include the new store ID
        const user = await User.findById(req.userData.userID);
        if (user) {
            user.stores.push(newStore._id); // Add new store ID to user's stores array
            await user.save();
        }

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
        console.log(store)
        res.status(200).json({ message: 'Store retrieved successfully', store });
    } catch (error) {
        console.error('Error retrieving store:', error);
        res.status(500).json({ message: 'Failed to retrieve store' });
    }
};

const getActiveTheme = async (req, res) => {
    try {
        // Extract store ID from request parameters
        const storeID = req.params.storeID;
        // Query the database for the activeTheme of the specified store
        const store = await Store.findById(storeID).select('activeTheme').lean();
        // Check if the store was found
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        // Return the activeTheme
        return res.status(200).json({ activeTheme: store.activeTheme });
    } catch (error) {
        // Handle any errors that occurred during the database query
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const updateStore = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    console.log(req.body);

    // Remove the products field from the updateData if it exists // products are being handled respectively 
    delete updateData.products;

    try {
        // Find the store by ID and update it with the new data
        const updatedStore = await Store.findByIdAndUpdate(id, updateData, {
            new: true, // Return the updated document
            runValidators: true, // Run schema validators
        });

        if (!updatedStore) {
            return res.status(404).send({ error: 'Store not found' });
        }

        res.send(updatedStore);
    } catch (error) {
        console.error('Error updating store:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}


module.exports = {
    createStore,
    getStore,
    getActiveTheme,
    updateStore
};
