const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const router = express.Router();

// Customer Login using Shopify Order ID
router.post("/login", async (req, res) => {
    const { email, orderId } = req.body;

    try {
        // Check order via Shopify API
        const shopifyResponse = await axios.get(`https://your-shopify-store.myshopify.com/admin/api/2023-01/orders.json`, {
            headers: { "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN }
        });

        const orders = shopifyResponse.data.orders;
        const validOrder = orders.find(order => order.email === email && order.id.toString() === orderId);

        if (!validOrder) {
            return res.status(401).json({ message: "Order not found or email mismatch" });
        }

        // Generate JWT Token
        const token = jwt.sign({ email, orderId, role: "customer" }, process.env.JWT_SECRET, { expiresIn: "3h" });

        res.json({ token });
    } catch (error) {
        console.error("Shopify API Error:", error);
        res.status(500).json({ message: "Error verifying order" });
    }
});

module.exports = router;
