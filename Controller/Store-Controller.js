const Store = require('../Model/Store-model'); // Import the Store model
const Product = require('../Model/Product-model'); // Import the Product model
const User = require('../Model/User-model'); // Import the User model|
const cloudinary = require("cloudinary").v2;
const esewaTransaction = require('../Model/Esewa-model');

const createStore = async (req, res) => {

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
    try {
        // Create products if products data is provided
        const dataExists = await Store.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
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
        // Retrieve store based on case-insensitive search by store name
        const store = await Store.findOne({ name: { $regex: new RegExp('^' + req.params.storeName + '$', 'i') } });
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Define product limits based on subscription status
        const productLimits = {
            Silver: 30,
            Gold: 1000,
            Platinum: 10000,
        };

        // Determine the limit based on the store's subscription status
        const limit = productLimits[store.subscriptionStatus] || 0;

        // Populate products with a limit
        await store.populate({
            path: 'products',
            options: { limit: limit }
        })

        res.status(200).json({ message: 'Store retrieved successfully', store });
    } catch (error) {
        console.error('Error retrieving store:', error);
        res.status(500).json({ message: 'Failed to retrieve store' });
    }
};


const getStoreByName = async (req, res) => {
    try {
        // Retrieve store with all products and staff based on storeName
        const storeName = req.params.storeName.trim();
        const store = await Store.findOne({ name: { $regex: new RegExp(`^${storeName}$`, 'i') } }).populate('owner');

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Define staff limits based on subscription status
        const staffLimits = {
            Silver: 2,
            Gold: 5,
            Platinum: 10,
        };

        // Determine the limit based on the store's subscription status
        const limit = staffLimits[store.subscriptionStatus] || 0;

        // Populate staff with a limit
        await store.populate({
            path: 'staff',
            options: { limit: limit }
        });

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
}

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


const updateDashboardStore = async (req, res) => {
    const { storeID } = req.params;
    const newData = req.body;

    try {
        // Fetch the old store data to check for existing images
        const oldStore = await Store.findById(storeID);

        // Check and delete old images if they exist and are being updated
        if (oldStore.esewa && oldStore.esewa.qr && oldStore.esewa.qr.imageUrl && oldStore.esewa.qr.imageUrl !== newData?.esewa?.qr?.imageUrl) {
            console.log("Deleting old eSewa image:", oldStore.esewa.qr.imageID);
            await cloudinary.uploader.destroy(oldStore.esewa.qr.imageID);
        }

        if (oldStore.bank && oldStore.bank.qr && oldStore.bank.qr.imageUrl && oldStore.bank.qr.imageUrl !== newData?.bank?.qr?.imageUrl) {
            console.log("Deleting old Bank image:", oldStore.bank.qr.imageID);
            await cloudinary.uploader.destroy(oldStore.bank.qr.imageID);
        }

        if (oldStore.khalti && oldStore.khalti.qr && oldStore.khalti.qr.imageUrl && oldStore.khalti.qr.imageUrl !== newData?.khalti?.qr?.imageUrl) {
            console.log("Deleting old Khalti image:", oldStore.khalti.qr.imageID);
            await cloudinary.uploader.destroy(oldStore.khalti.qr.imageID);
        }

        // Find the store by ID and update it with the new data
        const updatedStore = await Store.findByIdAndUpdate(
            storeID,
            { $set: newData },
            { new: true, runValidators: true }
        );

        // Check if the store was found and updated
        if (!updatedStore) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Return the updated store data
        return res.status(200).json({ updatedStore, message: 'Update successful' });
    } catch (error) {
        // Handle any errors that occurred during the update process
        console.error('Error updating store:', error);
        return res.status(500).json({ message: 'An error occurred while updating the store', error: error.message });
    }
};

const updateSubscription = async (req, res) => {
    const { transactionID } = req.params;
    try {
        // Fetch the transaction data to check for existing details
        const savedTransaction = await esewaTransaction.findById(transactionID);
        if (!savedTransaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Populate the store and select subscriptionStatus and subscriptionExpiry fields
        await savedTransaction.populate({
            path: 'store',
            select: 'subscriptionStatus subscriptionExpiry'
        })

        if (savedTransaction.used) {
            return res.status(401).json({ message: 'Payment Already Went Through' })
        }
        savedTransaction.used = true;

        const store = savedTransaction.store;
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Update store's subscription status
        store.subscriptionStatus = savedTransaction.subscription;
        await savedTransaction.save();
        // Calculate new subscriptionExpiry based on savedTransaction.duration
        const currentDate = new Date();
        let newExpiryDate;

        switch (savedTransaction.duration) {
            case 'monthly':
                if (store.subscriptionExpiry) {
                    newExpiryDate = new Date(store.subscriptionExpiry);
                    newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
                } else {
                    return res.status(400).json({ message: 'Previous subscription expiry not found' });
                }
                break;
            case 'quarterly':
                if (store.subscriptionExpiry) {
                    newExpiryDate = new Date(store.subscriptionExpiry);
                    newExpiryDate.setMonth(newExpiryDate.getMonth() + 3);
                } else {
                    return res.status(400).json({ message: 'Previous subscription expiry not found' });
                }
                break;
            case 'yearly':
                if (store.subscriptionExpiry) {
                    newExpiryDate = new Date(store.subscriptionExpiry);
                    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
                } else {
                    return res.status(400).json({ message: 'Previous subscription expiry not found' });
                }
                break;
            default:
                return res.status(400).json({ message: 'Invalid duration type' });
        }


        // Update store's subscriptionExpiry
        store.subscriptionExpiry = newExpiryDate;
        store.payments.push(transactionID);

        // Save the updated store data
        const updatedStore = await store.save();

        // Return the updated store data
        return res.status(200).json({ updatedStore, message: 'Update successful' });
    } catch (error) {
        // Handle any errors that occurred during the update process
        console.error('Error updating store:', error);
        return res.status(500).json({ message: 'An error occurred while updating the store', error: error.message });
    }
};

const updateSkin = async (req, res) => {
    const { transactionID } = req.params;
    try {
        // Fetch the transaction data to check for existing details
        const savedTransaction = await esewaTransaction.findById(transactionID);
        if (!savedTransaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check if the transaction has already been used
        if (savedTransaction.used) {
            return res.status(401).json({ message: 'Payment has already been processed' });
        }

        savedTransaction.used = true;
        await savedTransaction.save();

        // Populate the store and select necessary fields
        await savedTransaction.populate({
            path: 'store',
            select: 'componentSkin'
        });

        const store = savedTransaction.store;
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Extract skin details from savedTransaction
        const { skinType, name } = savedTransaction.skin;

        let skinAdded = false; // Track if skin was added
        // Update skinInventory in componentSkin
        store.componentSkin.forEach(component => {
            if (component.skinType === skinType) {
                if (!component.skinInventory.includes(name)) {
                    console.log("Adding skin to component:", component);
                    component.skinInventory.push(name);
                    skinAdded = true;
                } else {
                    console.log("Skin already exists in component:", component);
                }
            }
        });

        if (!skinAdded) {
            return res.status(400).json({ message: 'Skin was not added. Possible duplicate or mismatch in skinType.' });
        }

        // Save the updated store
        const updatedStore = await store.save();

        // Return the updated store data
        return res.status(200).json({ updatedStore, message: 'Skin update successful' });
    } catch (error) {
        // Handle any errors that occurred during the update process
        console.error('Error updating skin:', error);
        return res.status(500).json({ message: 'An error occurred while updating the skin', error: error.message });
    }
};






module.exports = {
    createStore,
    getStore,
    getActiveTheme,
    updateStore,
    deleteStore,
    getStoreByName,
    updateDashboardStore,
    updateSubscription,
    updateSkin
};
