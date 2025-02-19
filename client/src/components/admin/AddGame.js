import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddGame({ token }) {
    const navigate = useNavigate();
    const [gameDetails, setGameDetails] = useState({
        name: "",
        region: "",
        genre: "",
        description: "",
        category: "",
        downloadLink: "",
    });

    const [file, setFile] = useState(null);
    const [gamePicture, setGamePicture] = useState(null);
    const [gameplayPictures, setGameplayPictures] = useState([]); // ✅ Multiple files
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setGameDetails((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    };

    const handleFileChange = (e) => setFile(e.target.files[0]);
    const handleGamePictureChange = (e) => setGamePicture(e.target.files[0]);

    // ✅ Handle multiple gameplay pictures
    const handleGameplayPicturesChange = (e) => {
        setGameplayPictures([...e.target.files]); // Store multiple files in an array
    };

    const handleCancel = () => {
        navigate("/admin/dashboard");
    }

    const handleSubmit = async () => {
        if (!gameDetails.name || !gameDetails.category || !gamePicture) {
            alert("❌ Please fill in all required fields.");
            return;
        }
    
        const formData = new FormData();
        formData.append("name", gameDetails.name);
        formData.append("region", gameDetails.region);
        formData.append("genre", gameDetails.genre);
        formData.append("description", gameDetails.description);
        formData.append("category", gameDetails.category);
    
        // ✅ Only append `downloadLink` if it's provided
        if (gameDetails.downloadLink.trim() !== "") {
            formData.append("downloadLink", gameDetails.downloadLink);
        }
    
        if (file) formData.append("file", file);
        formData.append("gamePicture", gamePicture);
        gameplayPictures.forEach((picture) => formData.append("gameplayPictures", picture));
    
        try {
            setUploadProgress(0);
            setIsUploading(true);
    
            console.log("📌 Sending Game Add Request...");
            const apiUrl = process.env.REACT_APP_API_URL;
            await axios.post(`${apiUrl}/api/games/add`, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
    
            alert("✅ Game added successfully!");
            navigate("/admin/dashboard");
        } catch (error) {
            console.error("❌ Error Adding Game:", error.response ? error.response.data : error.message);
            alert("Failed to add game. Check console for details.");
        } finally {
            setIsUploading(false);
        }
    };
    

    return (
        <div className="dark-container">
            <h2 className="dark-title">Add New Content</h2>

            <div className="dark-card">
                <div className="input-group">
                    <label>Category *</label>
                    <div className="custom-select">
                        <select name="category" value={gameDetails.category} onChange={handleChange} required>
                            <option value="">Select Category</option>
                            <option value="GAMES">GAMES</option>
                            <option value="MOVIES">MOVIES</option>
                            <option value="EBOOTS">EBOOTS</option>
                            <option value="MISC">MISC</option>
                        </select>
                    </div>
                </div>
                <div className="input-group">
                    <label>Name *</label>
                    <input type="text" name="name" onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label>Region</label>
                    <input type="text" name="region" onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label>Genre</label>
                    <input type="text" name="genre" onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label>Description</label>
                    <textarea name="description" rows="3" onChange={handleChange}></textarea>
                </div>
                <div className="input-group">
                    <label>Upload File * (Max 5GB)</label>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} />
                </div>
                <div className="input-group">
                    <label>Upload Download Link</label>
                    <input type="text" name="downloadLink" onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label>Upload Initial Picture *</label>
                    <input type="file" onChange={handleGamePictureChange} />
                </div>
                <div className="input-group">
                    <label>Upload Play Pictures (Multiple)</label>
                    <input type="file" multiple onChange={handleGameplayPicturesChange} />
                </div>

                {/* ✅ Progress Bar */}
                {isUploading && (
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${uploadProgress}%` }}>
                            {uploadProgress}%
                        </div>
                    </div>
                )}

                <div className="button-group">
                    <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                    <button className="submit-btn" onClick={handleSubmit} disabled={isUploading}>
                        {isUploading ? "Uploading..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
}
