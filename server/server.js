require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json({ limit: "5GB" }));
app.use(express.urlencoded({ extended: true, limit: "5GB" }));
app.use(function(req, res, next) {
    req.setTimeout(0);  // No timeout for uploads
    next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));

// Import Routes
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const customerRoutes = require("./routes/customerRoutes");
const gameRoutes = require("./routes/gameRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/games", gameRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
