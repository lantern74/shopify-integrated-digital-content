const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const router = express.Router();

// Shopify API credentials
const SHOPIFY_API_URL = "https://pspvault.com/admin/api/2025-01/orders.json";
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

// Function to fetch orders page by page
async function findOrderByNumber(numericOrderNumber, email) {
    let nextPageUrl = `${SHOPIFY_API_URL}?status=any&limit=250`;

    while (nextPageUrl) {
        try {
            // Fetch orders from Shopify API
            const response = await axios.get(nextPageUrl, {
                headers: { "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN },
            });

            const orders = response.data.orders;

            // Search for the order in the current batch
            const order = orders.find(o => o.order_number === numericOrderNumber);

            if (order) {
                const orderEmail = order.contact_email || order.email;
                
                if (orderEmail && orderEmail.toLowerCase() === email.toLowerCase()) {
                    return order; // Order found and email matches
                } else {
                    return null; // Order found, but email does not match
                }
            }

            // Check if there's another page of orders
            const linkHeader = response.headers.link;
            const nextPageMatch = linkHeader?.match(/<([^>]+)>;\s*rel="next"/);
            nextPageUrl = nextPageMatch ? nextPageMatch[1] : null;

        } catch (error) {
            console.error("❌ Shopify API Error:", error.response?.data || error.message);
            return null;
        }
    }

    return null; // Order not found after searching all pages
}

// Customer Login Route
router.post("/login", async (req, res) => {
    const { email, orderNumber } = req.body;

    // Validate order number format
    const numericOrderNumber = Number(orderNumber);
    if (isNaN(numericOrderNumber)) {
        return res.status(400).json({ message: "Invalid Order Number format." });
    }

    // 🔍 Search order in Shopify
    const order = await findOrderByNumber(numericOrderNumber, email);

    if (!order) {
        return res.status(401).json({ message: "Order not found or email mismatch." });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign(
        { email, orderNumber: numericOrderNumber, role: "customer" },
        process.env.JWT_SECRET,
        { expiresIn: "3h" }
    );

    res.json({ token });
});

module.exports = router;
