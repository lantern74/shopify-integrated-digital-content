const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");

const router = express.Router();

// Connect to MongoDB
const conn = mongoose.connection;
let gfs, gridFSBucket;

conn.once("open", () => {
    gridFSBucket = new GridFSBucket(conn.db, { bucketName: "uploads" });
    console.log("✅ GridFSBucket initialized");
});

// Configure Multer for File Uploads (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to Verify JWT Token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided, access denied" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid or expired token" });
        req.user = decoded;
        next();
    });
};

// ✅ Upload Single or Multiple Files to GridFS
router.post("/upload", verifyToken, upload.array("files", 10), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
    }

    try {
        const uploadedFiles = [];

        for (const file of req.files) {
            await new Promise((resolve, reject) => {
                const uploadStream = gridFSBucket.openUploadStream(file.originalname, {
                    contentType: file.mimetype
                });

                uploadStream.end(file.buffer);
                
                uploadStream.on("finish", () => {
                    uploadedFiles.push({ filename: file.originalname, id: uploadStream.id.toString() });
                    resolve(); // ✅ Only resolve once upload is fully completed
                });

                uploadStream.on("error", (error) => {
                    console.error("❌ Upload Stream Error:", error);
                    reject(error);
                });
            });
        }

        res.json({ message: "Files uploaded successfully", files: uploadedFiles });
    } catch (error) {
        console.error("❌ Upload Error:", error);
        res.status(500).json({ message: "File upload failed" });
    }
});


// ✅ Fetch Uploaded Files (List all files)
router.get("/", verifyToken, async (req, res) => {
    try {
        const files = await conn.db.collection("uploads.files").find().toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ message: "No files found" });
        }
        res.json(files);
    } catch (error) {
        console.error("❌ Fetch Files Error:", error);
        res.status(500).json({ message: "Error fetching files" });
    }
});

// ✅ Download File
router.get("/download/:id", verifyToken, async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(req.params.id);
        
        // 🔍 Ensure the file exists before downloading
        const file = await conn.db.collection("uploads.files").findOne({ _id: fileId });
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        const downloadStream = gridFSBucket.openDownloadStream(fileId);
        res.set("Content-Type", file.contentType);
        res.set("Content-Disposition", `attachment; filename="${file.filename}"`);
        
        downloadStream.on("error", (err) => {
            console.error("❌ Download Stream Error:", err);
            res.status(500).json({ message: "Error streaming file" });
        });

        downloadStream.pipe(res);
    } catch (error) {
        console.error("❌ Download File Error:", error);
        res.status(500).json({ message: "Error downloading file" });
    }
});


// ✅ Delete File from GridFS
router.delete("/delete/:id", verifyToken, async (req, res) => {
    try {
        const fileId = new mongoose.Types.ObjectId(req.params.id);

        // 🔍 Ensure the file exists before deleting
        const file = await conn.db.collection("uploads.files").findOne({ _id: fileId });
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        await gridFSBucket.delete(fileId);
        res.json({ message: "File deleted successfully" });
    } catch (error) {
        console.error("❌ Delete File Error:", error);
        res.status(500).json({ message: "Error deleting file" });
    }
});



module.exports = router;
