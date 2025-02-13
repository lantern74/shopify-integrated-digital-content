const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const router = express.Router();

// Customer Login using Shopify Order ID
router.post("/login", async (req, res) => {
    const { email, orderNumber } = req.body;

    try {
        // Check if the orderNumber is provided and is a valid number
        const numericOrderNumber = Number(orderNumber);
        if (isNaN(numericOrderNumber)) {
            return res.status(400).json({ message: "Invalid Order Number format." });
        }

        // 🔍 Fetch orders from Shopify by order_number
        const shopifyResponse = await axios.get(
            `https://pspvault.com/admin/api/2023-01/orders.json?name=${numericOrderNumber}`,  // Search by order_number (name)
            { headers: { "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN } }
        );

        const orders = shopifyResponse.data.orders;
        console.log(orders, 'orders');

        // ✅ Validate if the order exists and matches the email
        const order = orders.find(o => o.email === email);

        if (!order) {
            return res.status(401).json({ message: "Order not found or email mismatch" });
        }

        // ✅ Generate JWT Token
        const token = jwt.sign(
            { email, orderNumber: numericOrderNumber, role: "customer" },
            process.env.JWT_SECRET,
            { expiresIn: "3h" }
        );

        res.json({ token });

    } catch (error) {
        console.error("❌ Shopify API Error:", error.response?.data || error.message);
        res.status(500).json({ message: "Error verifying order. Please try again later." });
    }
});


module.exports = router;
