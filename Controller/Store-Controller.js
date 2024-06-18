const Store = require('../Model/Store-model'); // Import the Store model
const Product = require('../Model/Product-model'); // Import the Product model
const User = require('../Model/User-model'); // Import the User model|
const mongoose = require('mongoose');

const createStore = async (req, res) => {

    console.log(req.body, "req body");
    const {
        name,
        logo,
        categories,
        subCategories,
        products,
        location,
        phoneNumber,
        email,
        color,
        secondaryBanner,
        banner,
        cart,
        offerBanner,
        thirdBanner,
        thirdBannerText,
        socialMediaLinks,
        footerDescription,
        secondaryBannerText,
        offerBannerText,
        fonts,
        featuredProducts,
    } = req.body.store;
    console.log(req.body.store, "store");
    try {
        // Create products if products data is provided
        const dataExists = await Store.findOne({ name });
        console.log(dataExists);
        if (dataExists) {
            return res.status(400).json({ message: "Store already exists" });
        }
        let savedProducts = [];

        if (products && products.length > 0) {
            // Iterate through products and create them
            for (const productData of products) {
                const {
                    name,
                    description,
                    category,
                    price,
                    image,
                    variant,
                    soldQuantity,
                    revenueGenerated,
                    subcategories,
                    inventory,
                    discount
                } = productData;

                // Create a new product instance
                const newProduct = new Product({
                    name,
                    description,
                    category,
                    subcategories,
                    price,
                    image,
                    variant,
                    soldQuantity,
                    revenueGenerated,
                    inventory,
                    discount
                });

                // Save the product to the database
                const savedProduct = await newProduct.save();
                savedProducts.push(savedProduct);
            }
        }
        // Create a new store instance
        const newStore = new Store({
            name,
            logo: {
                logoUrl: logo.logoUrl,
                logoID: logo.logoID
            },
            banner,
            categories,
            subCategories,
            products: savedProducts,
            location,
            phoneNumber,
            email: email,
            color,
            secondaryBanner: secondaryBanner,
            cart,
            socialMediaLinks,
            footerDescription,
            secondaryBannerText: {
                heading: secondaryBannerText.heading,
                paragraph: secondaryBannerText.paragraph
            },
            thirdBanner,
            thirdBannerText,
            offerBanner,
            offerBannerText: {
                para1: offerBannerText.para1,
                para2: offerBannerText.para2,
                para3: offerBannerText.para3
            },
            featuredProducts,
            fonts,
            owner: req.userData.userID // Set admin as req.userData.userID
        });

        // Save the store to the database
        await newStore.save();

        // Update user document to include the new store ID and the Owner role
        const user = await User.findById(req.userData.userID);
        if (user) {
            user.stores.push(newStore._id); // Add new store ID to user's stores array
            user.roles.push({
                storeId: newStore._id,
                role: 'Owner'
            }); // Add new role with storeId and role 'Owner'
            await user.save();
        }

        res.status(201).json({ message: 'Store created successfully', store: newStore });
    } catch (error) {
        console.error('Error creating store:', error);
        res.status(500).json({ message: 'Failed to create store' });
    }
};




const getStore = async (req, res) => {
    try {
        // Retrieve store with all products
        const store = await Store.findOne({ name: req.params.storeName })
            .populate('products');

        console.log(store, "store");
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        res.status(200).json({ message: 'Store retrieved successfully', store });
    } catch (error) {
        console.error('Error retrieving store:', error);
        res.status(500).json({ message: 'Failed to retrieve store' });
    }
};

const getStoreByName = async (req, res) => {
    try {
        // Retrieve store with all products and staff based on storeName
        const store = await Store.findOne({ name: req.params.storeName })
            .populate('products')
            .populate('staff');

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
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
    const updateData = req.body.store;

    // Remove the products field from the updateData if it exists // products are being handled respectively 
    // TODO Delete image left 
    delete updateData.products;
    console.log(req.body.store, "my body");
    try {
        // Find the store by ID and update it with the new data
        const updatedStore = await Store.findByIdAndUpdate(id, updateData, {
            new: true, // Return the updated document
            runValidators: true, // Run schema validators
        });

        if (!updatedStore) {
            return res.status(404).send({ error: 'Store not found' });
        }

        res.send({ message: "Store Updated Successfully" });
    } catch (error) {
        console.error('Error updating store:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

const deleteStore = async (req, res) => {
    try {
        const storeId = req.params.storeId;

        // Find the store by ID
        const store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Delete all images associated with the store from Cloudinary
        await Promise.all([
            cloudinary.uploader.destroy(store.logo.logoID),
            cloudinary.uploader.destroy(store.HeroSection.HeroSectionID),
            cloudinary.uploader.destroy(store.secondaryBanner.secondaryBannerID),
            cloudinary.uploader.destroy(store.thirdBanner.thirdBannerID)
            // Add more lines for other images if needed
        ]);

        for (const productId of store.products) {
            // Find the product by ID
            const product = await Product.findById(productId);

            if (!product) {
                console.warn(`Product with ID ${productId} not found`);
                continue; // Skip to the next product if not found
            }

            if (product.image && product.image.imageID) {
                await cloudinary.uploader.destroy(product.image.imageID);
            }
            // Loop through each variant of the product
            for (const variant of product.variant) {
                // Check if the variant has an image
                if (variant.image && variant.image.imageID) {
                    // Delete the image from Cloudinary
                    await cloudinary.uploader.destroy(variant.image.imageID);
                }
            }
        }
        // TODO : needs to have a loop through product which deletes images from cloudinary using cloudinary ID



        // Delete the store
        await store.remove();

        res.status(200).json({ message: 'Store deleted successfully' });
    } catch (error) {
        console.error('Error deleting store:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const getStoreByFilterV0 = async (req, res) => {
    try {
        let keyword = {};

        // Keyword search for _id, owner, email, name, phoneNumber, address
        if (req.query.search) {
            if (mongoose.Types.ObjectId.isValid(req.query.search)) {
                keyword.$or = [
                    { _id: req.query.search },
                    { owner: req.query.search }
                ];
            } else {
                keyword.$or = [
                    { email: { $regex: req.query.search, $options: "i" } },
                    { name: { $regex: req.query.search, $options: "i" } },
                    { phoneNumber: { $regex: req.query.search, $options: "i" } },
                    { address: { $regex: req.query.search, $options: "i" } },
                ];
            }
        }

        // Numerical filters
        if (req.query.dueAmount) {
            keyword.dueAmount = Number(req.query.dueAmount);
        }
        if (req.query.pendingAmount) {
            keyword.pendingAmount = Number(req.query.pendingAmount);
        }
        if (req.query.revenueGenerated) {
            keyword.revenueGenerated = Number(req.query.revenueGenerated);
        }

        // Handle ranges for numerical fields if necessary
        const parseRangeQuery = (query) => {
            if (!query) return;
            const range = {};
            if (query.min) range.$gte = Number(query.min);
            if (query.max) range.$lte = Number(query.max);
            return range;
        };

        const dueAmountRange = parseRangeQuery(req.query.dueAmountRange);
        if (dueAmountRange) {
            keyword.dueAmount = dueAmountRange;
        }

        const pendingAmountRange = parseRangeQuery(req.query.pendingAmountRange);
        if (pendingAmountRange) {
            keyword.pendingAmount = pendingAmountRange;
        }

        const revenueGeneratedRange = parseRangeQuery(req.query.revenueGeneratedRange);
        if (revenueGeneratedRange) {
            keyword.revenueGenerated = revenueGeneratedRange;
        }

        const stores = await Store.find(keyword, { password: 0, __v: 0 });
        return res.json({
            stores: stores,
        });
    } catch (error) {
        console.error('Error fetching stores:', error.message);
        res.status(500).json({ message: 'Fetching stores failed, please try again later.', error: error.message });
    }
};

const getStoreByFilterV1 = async (req, res) => {
    try {
        let keyword = {};

        // Keyword search for _id, owner, email, name, phoneNumber, address
        if (req.query.search) {
            if (mongoose.Types.ObjectId.isValid(req.query.search)) {
                keyword.$or = [
                    { _id: req.query.search },
                    { owner: req.query.search }
                ];
            } else {
                keyword.$or = [
                    { email: { $regex: req.query.search, $options: "i" } },
                    { location: { $regex: req.query.search, $options: "i" } },
                    { name: { $regex: req.query.search, $options: "i" } },
                    { phoneNumber: { $regex: req.query.search, $options: "i" } },
                    { address: { $regex: req.query.search, $options: "i" } },
                ];
            }
        }

        // Numerical filters
        if (req.query.dueAmount) {
            keyword.dueAmount = Number(req.query.dueAmount);
        }
        if (req.query.pendingAmount) {
            keyword.pendingAmount = Number(req.query.pendingAmount);
        }
        if (req.query.revenueGenerated) {
            keyword.revenueGenerated = Number(req.query.revenueGenerated);
        }

        // Handle ranges for numerical fields if necessary
        const parseRangeQuery = (query) => {
            if (!query) return;
            const range = {};
            if (query.min) range.$gte = Number(query.min);
            if (query.max) range.$lte = Number(query.max);
            return range;
        };

        const dueAmountRange = parseRangeQuery(req.query.dueAmountRange);
        if (dueAmountRange) {
            keyword.dueAmount = dueAmountRange;
        }

        const pendingAmountRange = parseRangeQuery(req.query.pendingAmountRange);
        if (pendingAmountRange) {
            keyword.pendingAmount = pendingAmountRange;
        }

        const revenueGeneratedRange = parseRangeQuery(req.query.revenueGeneratedRange);
        if (revenueGeneratedRange) {
            keyword.revenueGenerated = revenueGeneratedRange;
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const stores = await Store.find(keyword, { __v: 0 })
            .skip(skip)
            .limit(limit);

        return res.json({
            stores: stores,
            page: page,
            limit: limit,
            hasNextPage: stores.length === limit
        });
    } catch (error) {
        console.error('Error fetching stores:', error.message);
        res.status(500).json({ message: 'Fetching stores failed, please try again later.', error: error.message });
    }
};

const getStoreByFilter = async (req, res) => {
    try {
        let keyword = {};

        // Keyword search for _id, owner, staff, email, name, phoneNumber, address
        if (req.query.search) {
            if (mongoose.Types.ObjectId.isValid(req.query.search)) {
                keyword.$or = [
                    { _id: req.query.search },
                    { owner: req.query.search },
                    { staff: req.query.search }
                ];
            } else {
                keyword.$or = [
                    { email: { $regex: req.query.search, $options: "i" } },
                    { name: { $regex: req.query.search, $options: "i" } },
                    { location: { $regex: req.query.search, $options: "i" } },
                    { phoneNumber: { $regex: req.query.search, $options: "i" } },
                    { address: { $regex: req.query.search, $options: "i" } },
                ];
            }
        }

        // Numerical filters
        if (req.query.dueAmount) {
            keyword.dueAmount = Number(req.query.dueAmount);
        }
        if (req.query.pendingAmount) {
            keyword.pendingAmount = Number(req.query.pendingAmount);
        }
        if (req.query.revenueGenerated) {
            keyword.revenueGenerated = Number(req.query.revenueGenerated);
        }

        // Handle ranges for numerical fields if necessary
        const parseRangeQuery = (query) => {
            if (!query) return;
            const range = {};
            if (query.min) range.$gte = Number(query.min);
            if (query.max) range.$lte = Number(query.max);
            return range;
        };

        const dueAmountRange = parseRangeQuery(req.query.dueAmountRange);
        if (dueAmountRange) {
            keyword.dueAmount = dueAmountRange;
        }

        const pendingAmountRange = parseRangeQuery(req.query.pendingAmountRange);
        if (pendingAmountRange) {
            keyword.pendingAmount = pendingAmountRange;
        }

        const revenueGeneratedRange = parseRangeQuery(req.query.revenueGeneratedRange);
        if (revenueGeneratedRange) {
            keyword.revenueGenerated = revenueGeneratedRange;
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Keyset pagination with lastId
        if (req.query.lastId) {
            keyword._id = { $gt: req.query.lastId };
        }

        const stores = await Store.find(keyword, { 
                name: 1, 
                _id: 1, 
                staff: 1, 
                email: 1, 
                phoneNumber: 1, 
                location: 1, 
                dueAmount: 1, 
                pendingAmount: 1, 
                revenueGenerated: 1 
            })
            .skip(skip)
            .limit(limit);

        return res.json({
            stores: stores,
            page: page,
            limit: limit,
            hasNextPage: stores.length === limit
        });
    } catch (error) {
        console.error('Error fetching stores:', error.message);
        res.status(500).json({ message: 'Fetching stores failed, please try again later.', error: error.message });
    }
};

module.exports = {
    createStore,
    getStore,
    getActiveTheme,
    updateStore,
    deleteStore,
    getStoreByName,
    getStoreByFilter
};
