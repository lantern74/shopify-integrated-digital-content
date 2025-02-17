import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function EditGame({ token }) {
    const { id } = useParams(); // Get game ID from URL
    const navigate = useNavigate();

    const [gameDetails, setGameDetails] = useState({
        name: "",
        region: "",
        genre: "",
        description: "",
        category: "",
    });

    const [file, setFile] = useState(null);
    const [gamePicture, setGamePicture] = useState(null);
    const [gameplayPictures, setGameplayPictures] = useState([]);

    const [existingFileUrl, setExistingFileUrl] = useState("");
    const [existingGamePictureUrl, setExistingGamePictureUrl] = useState("");
    const [existingGameplayPictureUrls, setExistingGameplayPictureUrls] = useState([]);
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetchGameDetails();
    }, []);

    const fetchGameDetails = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/games/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const game = res.data;

            setGameDetails({
                name: game.name,
                region: game.region,
                genre: game.genre,
                description: game.description,
                category: game.category,
            });

            setExistingFileUrl(game.fileUrl ? `${apiUrl}/api/files/download/${game.fileUrl}` : "");
            setExistingGamePictureUrl(game.gamePicture ? `${apiUrl}/api/files/image/${game.gamePicture}` : "");
            setExistingGameplayPictureUrls(game.gameplayPictures ? game.gameplayPictures.map(pictureId => ({
                id: pictureId,
                url: `${apiUrl}/api/files/image/${pictureId}`
            })) : []);
        } catch (error) {
            console.error("❌ Error Fetching Game Details:", error);
            alert("Failed to load game data.");
        }
    };

    const handleChange = (e) => {
        setGameDetails({ ...gameDetails, [e.target.name]: e.target.value });
    };

    const handleCancel = () => {
        navigate("/admin/dashboard");
    }

    const handleFileChange = (e) => setFile(e.target.files[0]);
    const handleGamePictureChange = (e) => setGamePicture(e.target.files[0]);
    const handleGameplayPicturesChange = (e) => setGameplayPictures([...e.target.files]);

    const handleDeleteFile = async (fileType, fileId = null) => {
        if (!window.confirm(`Are you sure you want to delete this ${fileType}?`)) return;
    
        try {
            let deleteUrl = "";
            if (fileType === "gameplayPictures" && fileId) {
                // ✅ Delete a single gameplay picture
                deleteUrl = `${apiUrl}/api/games/delete-gameplay/${id}/${fileId}`;
            } else {
                // ✅ Delete file or game picture
                deleteUrl = `${apiUrl}/api/games/files/delete/${id}/${fileType}`;
            }
    
            await axios.delete(deleteUrl, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            alert(`${fileType} deleted successfully!`);
    
            // ✅ Update UI after deletion
            if (fileType === "file") setExistingFileUrl("");
            if (fileType === "gamePicture") setExistingGamePictureUrl("");
            if (fileType === "gameplayPictures") {
                setExistingGameplayPictureUrls(existingGameplayPictureUrls.filter(pic => pic.id !== fileId));
            }
        } catch (error) {
            console.error(`❌ Error deleting ${fileType}:`, error);
            alert(`Failed to delete ${fileType}`);
        }
    };
    
    const handleSubmit = async () => {
        if (!gameDetails.name) {
            alert("Please fill in all required fields.");
            return;
        }

        const formData = new FormData();
        formData.append("name", gameDetails.name);
        formData.append("region", gameDetails.region);
        formData.append("genre", gameDetails.genre);
        formData.append("description", gameDetails.description);
        formData.append("category", gameDetails.category);

        if (file) formData.append("file", file);
        if (gamePicture) formData.append("gamePicture", gamePicture);
        gameplayPictures.forEach((pic) => formData.append("gameplayPictures", pic));

        try {
            console.log("📌 Sending Game Update Request...");
            await axios.put(`${apiUrl}/api/games/update/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            });

            alert("Game updated successfully!");
            navigate("/admin/dashboard");
        } catch (error) {
            console.error("❌ Error Updating Game:", error);
            alert("Failed to update game.");
        }
    };

    return (
        <div className="edit-game-container">
            <h2 className="edit-game-title">Edit Content</h2>

            <div className="edit-game-card">
                <div className="edit-game-input-group">
                    <label>Category *</label>
                    <div className="custom-select">
                        <select name="category" value={gameDetails.category} onChange={handleChange} required>
                            <option value="">Select Category</option>
                            <option value="Games">Games</option>
                            <option value="Movies">Movies</option>
                            <option value="Images">Images</option>
                            <option value="Documents">Documents</option>
                        </select>
                    </div>
                </div>
                <div className="edit-game-input-group">
                    <label>Name *</label>
                    <input type="text" name="name" value={gameDetails.name} onChange={handleChange} />
                </div>
                <div className="edit-game-input-group">
                    <label>Region</label>
                    <input type="text" name="region" value={gameDetails.region} onChange={handleChange} />
                </div>
                <div className="edit-game-input-group">
                    <label>Genre</label>
                    <input type="text" name="genre" value={gameDetails.genre} onChange={handleChange} />
                </div>
                <div className="edit-game-input-group">
                    <label>Description</label>
                    <textarea name="description" rows="3" value={gameDetails.description} onChange={handleChange}></textarea>
                </div>

                {/* Game File Upload */}
                <div className="edit-game-input-group">
                    <label>File * (Max 5GB)</label>
                    {existingFileUrl && (
                        <div className="d-flex align-items-center" style={{marginBottom: '5px'}}>
                            <a href={existingFileUrl} className="me-3" download>📂 Download Current File</a>
                            <span className="text-danger" style={{ cursor: "pointer" }} onClick={() => handleDeleteFile("file")}>❌</span>
                        </div>
                    )}
                    <input type="file" onChange={handleFileChange} />
                </div>

                {/* Game Picture Upload */}
                <div className="edit-game-input-group">
                    <label>Initial Picture *</label>
                    {existingGamePictureUrl && (
                        <div className="position-relative" style={{marginBottom: '5px'}}>
                            <img src={existingGamePictureUrl} alt="Game" className="img-thumbnail" style={{ width: "150px", height: "100px" }} />
                            <span className="position-absolute top-0 bg-danger text-white px-2" style={{ cursor: "pointer" }} onClick={() => handleDeleteFile("gamePicture")}>❌</span>
                        </div>
                    )}
                    <input type="file" onChange={handleGamePictureChange} />
                </div>

                {/* Gameplay Pictures Upload */}
                <div className="edit-game-input-group">
                    <label>Play Pictures (Multiple)</label>
                    <div className="editGameGrid">
                        {existingGameplayPictureUrls.map((pic) => (
                            <div key={pic.id} className="position-relative me-2" style={{marginBottom: '5px'}}>
                                <img src={pic.url} alt="Gameplay" className="img-thumbnail" style={{ width: "80px", height: "80px" }} />
                                <span className="position-absolute top-0 end-0 bg-danger text-white px-2" style={{ cursor: "pointer" }} onClick={() => handleDeleteFile("gameplayPictures", pic.id)}>❌</span>
                            </div>
                        ))}
                    </div>
                    <input type="file" multiple onChange={handleGameplayPicturesChange} />
                </div>
                <div className="edit-game-button-group">
                    <button className="edit-game-cancel-btn" onClick={handleCancel}>Cancel</button>
                    <button className="edit-game-submit-btn" onClick={handleSubmit}>Update</button>
                </div>
            </div>
        </div>
    );
}
