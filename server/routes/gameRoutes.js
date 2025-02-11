const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// ✅ MongoDB Connection & GridFS Setup
const conn = mongoose.connection;
let gridFSBucket;

conn.once("open", () => {
    gridFSBucket = new GridFSBucket(conn.db, { bucketName: "uploads" });
});

// ✅ Multer Disk Storage (Temporary Local Storage Before Uploading to GridFS)
const storage = multer.diskStorage({
    destination: "./tempUploads", // Store temporarily before streaming to GridFS
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

// ✅ Game Model (Store Only ObjectId of Files)
const Game = mongoose.model("Game", new mongoose.Schema({
    name: String,
    region: String,
    genre: String,
    description: String,
    fileUrl: mongoose.Schema.Types.ObjectId,
    gamePicture: mongoose.Schema.Types.ObjectId,
    gameplayPicture: mongoose.Schema.Types.ObjectId,
}));

// ✅ Function to Upload File to GridFS
const uploadFileToGridFS = (filePath, fileName, mimeType) => {
    return new Promise((resolve, reject) => {
        const uploadStream = gridFSBucket.openUploadStream(fileName, { contentType: mimeType });
        fs.createReadStream(filePath)
            .pipe(uploadStream)
            .on("finish", () => {
                fs.unlinkSync(filePath); // ✅ Delete temp file after upload
                resolve(uploadStream.id);
            })
            .on("error", reject);
    });
};

// ✅ Add Game with Large File Upload Support
router.post("/add", upload.fields([{ name: "file" }, { name: "gamePicture" }, { name: "gameplayPicture" }]), async (req, res) => {
    try {
        if (!req.body.name || !req.files["file"] || !req.files["gamePicture"]) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        console.log("📌 Files Uploaded:", req.files);

        // ✅ Upload files to GridFS
        const fileId = await uploadFileToGridFS(req.files["file"][0].path, req.files["file"][0].originalname, req.files["file"][0].mimetype);
        const gamePictureId = await uploadFileToGridFS(req.files["gamePicture"][0].path, req.files["gamePicture"][0].originalname, req.files["gamePicture"][0].mimetype);
        const gameplayPictureId = req.files["gameplayPicture"]
            ? await uploadFileToGridFS(req.files["gameplayPicture"][0].path, req.files["gameplayPicture"][0].originalname, req.files["gameplayPicture"][0].mimetype)
            : null;

        // ✅ Save Game Data in MongoDB
        const newGame = new Game({
            name: req.body.name,
            region: req.body.region,
            genre: req.body.genre,
            description: req.body.description,
            fileUrl: fileId,
            gamePicture: gamePictureId,
            gameplayPicture: gameplayPictureId,
        });

        await newGame.save();
        console.log("✅ Game Saved Successfully:", newGame);
        res.json({ message: "Game added successfully!", game: newGame });

    } catch (error) {
        console.error("❌ Error Adding Game:", error);
        res.status(500).json({ message: "Error adding game." });
    }
});

// ✅ Fetch all games
router.get("/", async (req, res) => {
    try {
        const games = await Game.find();
        res.json(games);
    } catch (error) {
        console.error("❌ Fetch Games Error:", error);
        res.status(500).json({ message: "Error fetching games" });
    }
});

module.exports = router;
