const mongoose = require('mongoose');
const EsewaTransaction = require('../Model/Esewa-model');
const crypto = require("crypto");
const Payment = require('../Model/Payment-Model');

const createPayment = async (req, res) => {
    try {
        console.log(req.body);  // Check if req.body has the required data

        // Save the payment data using the Payment model
        const newPayment = new Payment(req.body.data);
        const savedPayment = await newPayment.save();

        // Assuming you need data from savedPayment for formData
        const signature = createSignature(
            `total_amount=${savedPayment.amount},transaction_uuid=${savedPayment._id},product_code=EPAYTEST`
        );

        const formData = {
            amount: savedPayment.amount,
            failure_url: "https://google.com",
            product_delivery_charge: "0",
            product_service_charge: "0",
            product_code: "EPAYTEST",
            signature: signature,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            success_url: "http://localhost:3000/esewa",
            tax_amount: "0",
            total_amount: savedPayment.amount,
            transaction_uuid: savedPayment._id,
        };
        
        res.json({ message: "Order Created Successfully", payment: savedPayment, formData });
    } catch (err) {
        return res.status(400).json({ error: err?.message || "Error creating order" });
    }
};

const createSignature = (message) => {
    const secret = "8gBm/:&EnhH.1/q";
    // Create an HMAC-SHA256 hash
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(message);

    // Get the digest in base64 format
    const hashInBase64 = hmac.digest("base64");
    return hashInBase64;
};

module.exports = { createPayment };
