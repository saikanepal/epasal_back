// Require necessary modules
const bcrypt = require('bcrypt');
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

const updateUserRole = async (req, res) => {
    const { userId, newRole } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        const validRoles = ['Owner', 'Admin', 'Staff', 'Delivery'];
        if (!validRoles.includes(newRole)) {
            throw { status: 400, message: 'Invalid role' };
        }

        user.role = newRole;
        await user.save();

        res.status(200).json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error(error.message);
        const status = error.status || 500;
        res.status(status).json({ message: error.message });
    }
};

// Export the functions
module.exports = { signUp, signIn, verifyUser ,updateUserRole};
