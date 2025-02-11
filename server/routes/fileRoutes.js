const express = require("express");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

const router = express.Router();
const conn = mongoose.connection;
let gridFSBucket;

conn.once("open", () => {
    gridFSBucket = new GridFSBucket(conn.db, { bucketName: "uploads" });
});

// ✅ Download File (Protected - Requires Token)
router.get("/download/:id", async (req, res) => {
    try {
        const fileId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({ message: "Invalid file ID" });
        }

        const objectId = new mongoose.Types.ObjectId(fileId);
        const file = await conn.db.collection("uploads.files").findOne({ _id: objectId });

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        res.set("Content-Type", file.contentType);
        res.set("Content-Disposition", `attachment; filename="${file.filename}"`);

        const downloadStream = gridFSBucket.openDownloadStream(objectId);
        downloadStream.pipe(res);
    } catch (error) {
        console.error("❌ Download File Error:", error);
        res.status(500).json({ message: "Error downloading file" });
    }
});

// ✅ Fetch Image Without Token (For Game Pictures)
router.get("/image/:id", async (req, res) => {
    try {
        const fileId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({ message: "Invalid file ID" });
        }

        const objectId = new mongoose.Types.ObjectId(fileId);
        const file = await conn.db.collection("uploads.files").findOne({ _id: objectId });

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        res.set("Content-Type", file.contentType);
        const downloadStream = gridFSBucket.openDownloadStream(objectId);
        downloadStream.pipe(res);
    } catch (error) {
        console.error("❌ Image Fetch Error:", error);
        res.status(500).json({ message: "Error fetching image" });
    }
});

module.exports = router;
