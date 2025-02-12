const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const router = express.Router();

// Customer Login using Shopify Order ID
router.post("/login", async (req, res) => {
    const { email, orderId } = req.body;

    try {
        // Convert orderId to number (Shopify orders are numeric)
        const numericOrderId = Number(orderId);
        if (isNaN(numericOrderId)) {
            return res.status(400).json({ message: "Invalid Order ID format." });
        }

        // 🔍 Fetch order directly using Shopify API
        const shopifyResponse = await axios.get(
            `https://pspvault.com/admin/api/2023-01/orders/${numericOrderId}.json`,
            { headers: { "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN } }
        );

        const order = shopifyResponse.data.order;

        // ✅ Validate email matches order
        if (!order || order.email !== email) {
            return res.status(401).json({ message: "Order not found or email mismatch" });
        }

        // ✅ Generate JWT Token
        const token = jwt.sign(
            { email, orderId: numericOrderId, role: "customer" },
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
