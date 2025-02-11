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

// ✅ Get a Single Game by ID
router.get("/:id", async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        if (!game) return res.status(404).json({ message: "Game not found" });
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: "Error fetching game details" });
    }
});

// ✅ Update Game Data
router.put("/update/:id", upload.fields([{ name: "file" }, { name: "gamePicture" }, { name: "gameplayPictures" }]), async (req, res) => {
    try {
        const gameId = req.params.id;
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        console.log("📌 Updating Game Data:", req.body);

        // ✅ Upload new files if provided
        const uploadNewFile = async (file) => {
            return await uploadFileToGridFS(file.path, file.originalname, file.mimetype);
        };

        // ✅ Handle file replacement (Game File)
        if (req.files["file"]) {
            if (game.fileUrl) {
                await gridFSBucket.delete(new mongoose.Types.ObjectId(game.fileUrl)); // Delete old file
            }
            game.fileUrl = await uploadNewFile(req.files["file"][0]); // Upload new file
        }

        // ✅ Handle game picture replacement
        if (req.files["gamePicture"]) {
            if (game.gamePicture) {
                await gridFSBucket.delete(new mongoose.Types.ObjectId(game.gamePicture)); // Delete old picture
            }
            game.gamePicture = await uploadNewFile(req.files["gamePicture"][0]); // Upload new picture
        }

        // ✅ Handle multiple gameplay pictures
        if (req.files["gameplayPictures"]) {
            // Delete old gameplay pictures
            if (game.gameplayPictures.length > 0) {
                await Promise.all(game.gameplayPictures.map(fileId => gridFSBucket.delete(new mongoose.Types.ObjectId(fileId))));
            }
            // Upload new gameplay pictures
            game.gameplayPictures = await Promise.all(req.files["gameplayPictures"].map(uploadNewFile));
        }

        // ✅ Update text fields
        game.name = req.body.name || game.name;
        game.region = req.body.region || game.region;
        game.genre = req.body.genre || game.genre;
        game.description = req.body.description || game.description;

        await game.save();

        console.log("✅ Game Updated Successfully:", game);
        res.json({ message: "Game updated successfully!", game });

    } catch (error) {
        console.error("❌ Error Updating Game:", error);
        res.status(500).json({ message: "Error updating game." });
    }
});


// ✅ DELETE specific file from game (file, gamePicture, gameplayPictures)
router.delete("/files/delete/:id/:fileType", async (req, res) => {
    const { id, fileType } = req.params;

    try {
        const game = await Game.findById(id);
        if (!game) return res.status(404).json({ message: "Game not found" });

        let fileIdToDelete = null;

        if (fileType === "file") {
            fileIdToDelete = game.fileUrl;
            game.fileUrl = null;
        } else if (fileType === "gamePicture") {
            fileIdToDelete = game.gamePicture;
            game.gamePicture = null;
        } else if (fileType === "gameplayPictures") {
            fileIdToDelete = game.gameplayPictures;
            game.gameplayPictures = [];
        } else {
            return res.status(400).json({ message: "Invalid file type" });
        }

        if (fileIdToDelete) {
            await gridFSBucket.delete(new mongoose.Types.ObjectId(fileIdToDelete));
            await game.save();
        }

        res.json({ message: `${fileType} deleted successfully!` });

    } catch (error) {
        console.error("❌ Error deleting file:", error);
        res.status(500).json({ message: "Error deleting file." });
    }
});

// ✅ DELETE a Specific Gameplay Picture (Individually)
router.delete("/delete-gameplay/:gameId/:fileId", async (req, res) => {
    try {
        const { gameId, fileId } = req.params;

        // ✅ Validate if fileId is a correct MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({ message: "Invalid file ID format" });
        }

        const objectId = new mongoose.Types.ObjectId(fileId);

        // ✅ Ensure the file exists before deleting
        const file = await conn.db.collection("uploads.files").findOne({ _id: objectId });
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        // ✅ Delete file from GridFS
        await gridFSBucket.delete(objectId);

        // ✅ Remove the file reference from the game document
        await Game.findByIdAndUpdate(gameId, { $pull: { gameplayPictures: fileId } });

        res.json({ message: "Gameplay picture deleted successfully!" });

    } catch (error) {
        console.error("❌ Error deleting file:", error);
        res.status(500).json({ message: "Error deleting gameplay picture" });
    }
});

// // 🔍 SEARCH GAMES BY NAME, REGION, OR GENRE
// router.get("/search", async (req, res) => {
//     try {
//         let { query } = req.query; // ✅ Get query parameter from the request URL

//         // ✅ If no query is provided, return all games
//         if (!query || query.trim() === "") {
//             console.log("🔍 No search query provided, returning all games.");
//             return res.json(await Game.find());
//         }

//         query = query.trim();
//         console.log(`📌 Searching for games matching: "${query}"`);

//         // ✅ Perform case-insensitive search
//         const games = await Game.find({
//             $or: [
//                 { name: { $regex: query, $options: "i" } }, 
//                 { region: { $regex: query, $options: "i" } }, 
//                 { genre: { $regex: query, $options: "i" } }
//             ]
//         });

//         if (games.length === 0) {
//             console.log(`⚠ No games found for search: "${query}"`);
//         } else {
//             console.log(`✅ Found ${games.length} games for search: "${query}"`);
//         }

//         res.json(games);
        
//     } catch (error) {
//         console.error("❌ Search Error:", error);
//         res.status(500).json({ message: "Internal Server Error - Unable to fetch search results.", error: error.message });
//     }
// });







module.exports = router;
