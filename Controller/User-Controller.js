// Require necessary modules
const bcrypt = require('bcrypt');
const Store = require('../Model/Store-model.js');
const User = require('../Model/User-model');
const crypto = require('crypto');
const sendVerificationEmail = require('../utils/generateVerificationCode.js'); // Import the function
const jwt = require('jsonwebtoken');
// Secret key for bcrypt encryption
const saltRounds = 10; // Number of salt rounds

const signUp = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    try {
        // Check if the user already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            throw { status: 400, message: 'User already exists' };
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            throw { status: 400, message: 'Passwords do not match' };
        }

        // Encrypt the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate verification code
        const verificationCode = generateVerificationCode();

        // Create the new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword, // Store hashed password
            verificationCode,
            isVerified: false
        });

        // Send verification email
        sendVerificationEmail(email, verificationCode);

        // Save the user to the database
        await newUser.save();

        res.status(201).json({ message: 'User created successfully. Verification email sent.' });
    } catch (error) {
        console.error(error);
        const status = error.status || 500;
        res.status(status).json({ message: error.message });
    }
};

const signIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw { status: 401, message: 'Invalid password' };
        }

        // Check if user is verified
        if (!user.isVerified) {
            // Resend verification code
            const verificationCode = generateVerificationCode();
            user.verificationCode = verificationCode;
            await user.save();
            sendVerificationEmail(email, verificationCode); // Resend verification email
            throw { status: 403, message: 'User not verified. Verification code resent.' };
        }

        //token for local storage
        const token = jwt.sign({
            userID: user.id,
            email: user.email
        }, process.env.JWT_KEY,
            {
                expiresIn: '24h'
            });
        if (!token) {
            throw new Error("Signing Up Failed ,Please Try again Later")
        }

        // Compare passwords

        res.status(200).json
            ({
                user: {
                    id: user.id
                }, token: token, message: "Sign up Successful"
            });
    } catch (error) {
        console.error(error.message);
        const status = error.status || 500;
        res.status(status).json({ message: error.message });
    }
};

const verifyUser = async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        // Check if verification code matches
        if (user.verificationCode !== verificationCode) {
            throw { status: 400, message: 'Invalid verification code' };
        }

        // Update user's isVerified status to true
        user.isVerified = true;
        await user.save();

        //token for local storage
        const token = jwt.sign({
            userID: user.id,
            email: user.email
        }, process.env.JWT_KEY,
            {
                expiresIn: '24h'
            });
        if (!token) {
            throw new Error("Signing Up Failed ,Please Try again Later")
        }

        res.status(200).json
            ({
                user: {
                    id: user.id
                }, token: token, message: "Sign up Successful"
            });
        res.status(200).json({ message: 'User verified successfully' });
    } catch (error) {
        console.error(error.message);
        const status = error.status || 500;
        res.status(status).json({ message: error.message });
    }
};

// Generate a secure verification code
const generateVerificationCode = () => {
    // Generate 3 random bytes (24 bits) and convert to hexadecimal representation
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    return code;
};

const getLoggedInUser = async() => {
    try {
        const userId = req.userData.userID; 
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        // Handle error
        console.error("Error fetching user by ID:", error);
        throw error;
    }
}



const addEmployee = async (req, res) => {
    const { email, storeId, newRole } = req.body;


    try {
        // Check if the store exists
        const store = await Store.findById(storeId);
        if (!store) {
            throw { status: 404, message: 'Store not found' };
        }
        // Find the user by email
        const user = await User.findOne({ email: email });
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        const validRoles = ['Staff', 'Delivery', 'Admin'];
        if (!validRoles.includes(newRole)) {
            throw { status: 400, message: 'Invalid role' };
        }

        // Check if the user already has a role for the specified store
        const existingRole = user.roles.find(role => role.storeId.toString() === storeId);
        if (existingRole) {
            return res.status(400).json({ message: 'User already has a role for this store' });
        }
        user.stores.push(store._id);
        // Add a new role entry
        user.roles.push({ storeId, role: newRole });

        // Save the user with the new role
        await user.save();

        // Add user ID to the store's staff array 
        store.staff.push(user._id);
        await store.save();

        res.status(200).json({ message: 'Employee role added successfully' });
    } catch (error) {
        console.error('Error adding employee:', error);
        const status = error.status || 500;
        res.status(status).json({ message: error.message });
    }
};



// Function for updating user role by an owner
const updateUserRoleByOwner = async (req, res) => {
    const { userId, storeId, newRole } = req.body;
    console.log("owner is updating");
    try {
        const loggedInUser = await User.findById(req.userData.userID);
        console.log(loggedInUser._id);
        const loggedInUserRole = loggedInUser.roles.findIndex(role => role.storeId.toString() === storeId);
        if (loggedInUserRole.role != 'Owner' && loggedInUserRole.role == 'Admin') {
            console.log("not right");
            updateUserRoleByAdmin();
        }
        const user = await User.findById(userId);

        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        const validRoles = ['Admin', 'Staff', 'Delivery'];
        if (!validRoles.includes(newRole)) {
            throw { status: 400, message: 'Invalid role' };
        }

        // Find the role entry for the specified store
        const roleIndex = user.roles.findIndex(role => role.storeId.toString() === storeId);

        if (roleIndex !== -1) {
            // Update the existing role
            user.roles[roleIndex].role = newRole;
        } else {
            // Add a new role entry
            user.roles.push({ storeId, role: newRole });
        }

        await user.save();
        res.status(200).json({ message: 'User role updated successfully' });

    } catch (error) {
        console.error(error.message);
        const status = error.status || 500;
        res.status(402).json({ message: error.message });
    }
};

// Function for updating user role by an admin
const updateUserRoleByAdmin = async (req, res) => {
    const { userId, storeId, newRole } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        const validRoles = ['Staff', 'Delivery'];
        if (!validRoles.includes(newRole)) {
            throw { status: 400, message: 'Invalid role' };
        }

        // Find the role entry for the specified store
        const roleIndex = user.roles.findIndex(role => role.storeId.toString() === storeId);

        if (roleIndex !== -1) {
            // Update the existing role
            user.roles[roleIndex].role = newRole;
        } else {
            // Add a new role entry
            user.roles.push({ storeId, role: newRole });
        }

        await user.save();
        res.status(200).json({ message: 'User role updated successfully' });

    } catch (error) {
        console.error(error.message);
        const status = error.status || 500;
        res.status(status).json({ message: error.message });
    }
};


const deleteEmployee = async (req, res) => {
    const { userId, storeId } = req.body;
    try {
        // Find the user by their ID
        const user = await User.findById(userId);

        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        // Remove the role entry for the specified store
        user.roles = user.roles.filter(role => role.storeId.toString() !== storeId);

        // Remove the store ID from the user's stores array
        user.stores = user.stores.filter(store => store.toString() !== storeId);

        await user.save();

        // Find the store by its ID
        const store = await Store.findById(storeId);
        if (!store) {
            throw { status: 404, message: 'Store not found' };
        }

        // Remove the user ID from the store's staff array
        await Store.updateOne({ _id: storeId }, { $pull: { staff: userId } });

        res.status(200).json({ message: 'Employee role deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee role:', error);
        const status = error.status || 500;
        res.status(status).json({ message: error.message });
    }
};


// Export the functions
module.exports = { signUp, signIn, verifyUser, updateUserRoleByOwner, updateUserRoleByAdmin, addEmployee, deleteEmployee ,getLoggedInUser};
