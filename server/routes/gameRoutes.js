const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const fs = require("fs");

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
        cb(null, `${Date.now()}-${file.originalname}`); // Prevent duplicate names
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
    gameplayPictures: [mongoose.Schema.Types.ObjectId], // ✅ Store multiple gameplay pictures
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

// ✅ Add Game with Multi Gameplay Pictures Support
router.post("/add", upload.fields([
    { name: "file" },
    { name: "gamePicture" },
    { name: "gameplayPictures", maxCount: 10 } // ✅ Allow up to 10 gameplay pictures
]), async (req, res) => {
    try {
        if (!req.body.name || !req.files["file"] || !req.files["gamePicture"]) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        console.log("📌 Files Uploaded:", req.files);

        // ✅ Upload files to GridFS
        const fileId = await uploadFileToGridFS(req.files["file"][0].path, req.files["file"][0].originalname, req.files["file"][0].mimetype);
        const gamePictureId = await uploadFileToGridFS(req.files["gamePicture"][0].path, req.files["gamePicture"][0].originalname, req.files["gamePicture"][0].mimetype);

        // ✅ Upload multiple gameplay pictures asynchronously
        const gameplayPictureIds = req.files["gameplayPictures"]
            ? await Promise.all(req.files["gameplayPictures"].map(file =>
                uploadFileToGridFS(file.path, file.originalname, file.mimetype)
            ))
            : [];

        // ✅ Save Game Data in MongoDB
        const newGame = new Game({
            name: req.body.name,
            region: req.body.region,
            genre: req.body.genre,
            description: req.body.description,
            fileUrl: fileId,
            gamePicture: gamePictureId,
            gameplayPictures: gameplayPictureIds, // ✅ Store array of ObjectIds
        });

        await newGame.save();
        console.log("✅ Game Saved Successfully:", newGame);
        res.json({ message: "Game added successfully!", game: newGame });

    } catch (error) {
        console.error("❌ Error Adding Game:", error);
        res.status(500).json({ message: "Error adding game." });
    }
});

// ✅ Fetch all games (List Games)
router.get("/", async (req, res) => {
    try {
        const games = await Game.find();
        res.json(games);
    } catch (error) {
        console.error("❌ Fetch Games Error:", error);
        res.status(500).json({ message: "Error fetching games" });
    }
});

// ✅ Delete Game Route
router.delete("/:id", async (req, res) => {
    try {
        const gameId = req.params.id;

        // 🔍 Find the game in the database
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        console.log("📌 Deleting Game:", game);

        // ✅ Delete associated files from GridFS
        const deleteFileFromGridFS = async (fileId) => {
            if (!fileId) return;
            try {
                await gridFSBucket.delete(new mongoose.Types.ObjectId(fileId));
                console.log(`✅ Deleted File from GridFS: ${fileId}`);
            } catch (error) {
                console.error(`❌ Error Deleting File ${fileId}:`, error);
            }
        };

        // ✅ Delete game file
        await deleteFileFromGridFS(game.fileUrl);

        // ✅ Delete game picture
        await deleteFileFromGridFS(game.gamePicture);

        // ✅ Delete all gameplay pictures (multiple files)
        if (game.gameplayPictures && game.gameplayPictures.length > 0) {
            await Promise.all(game.gameplayPictures.map(fileId => deleteFileFromGridFS(fileId)));
        }

        // ✅ Delete game from MongoDB
        await Game.findByIdAndDelete(gameId);
        console.log("✅ Game Deleted Successfully!");

        res.json({ message: "Game and associated files deleted successfully!" });

    } catch (error) {
        console.error("❌ Delete Game Error:", error);
        res.status(500).json({ message: "Error deleting game and associated files." });
    }
});


module.exports = router;
