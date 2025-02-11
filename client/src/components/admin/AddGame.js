import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../../App.css'

export default function AddGame({ token }) {
    const navigate = useNavigate();
    const [gameDetails, setGameDetails] = useState({
        name: "",
        region: "",
        genre: "",
        description: ""
    });

    const [file, setFile] = useState(null);
    const [gamePicture, setGamePicture] = useState(null);
    const [gameplayPicture, setGameplayPicture] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress
    const [isUploading, setIsUploading] = useState(false); // Track loading state
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setGameDetails({ ...gameDetails, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => setFile(e.target.files[0]);
    const handleGamePictureChange = (e) => setGamePicture(e.target.files[0]);
    const handleGameplayPictureChange = (e) => setGameplayPicture(e.target.files[0]);

    const handleSubmit = async () => {
        if (!gameDetails.name || !file || !gamePicture) {
            alert("Please fill in all fields and upload files.");
            return;
        }
    
        const formData = new FormData();
        formData.append("name", gameDetails.name);
        formData.append("region", gameDetails.region);
        formData.append("genre", gameDetails.genre);
        formData.append("description", gameDetails.description);
        formData.append("file", file);
        formData.append("gamePicture", gamePicture);
        if (gameplayPicture) {
            formData.append("gameplayPicture", gameplayPicture);
        }

        try {
            setUploadProgress(0); // Reset progress
            setIsUploading(true); // Start loading
    
            console.log("📌 Sending Game Add Request...");
            await axios.post("http://localhost:5000/api/games/add", formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted); // Update progress bar
                }
            });
    
            alert("Game added successfully!");
            navigate("/admin/dashboard"); // ✅ Redirect to Dashboard after adding
            window.location.reload(); // ✅ Force refresh the page to fetch new games
        } catch (error) {
            console.error("❌ Error Adding Game:", error.response ? error.response.data : error.message);
            alert("Failed to add game. Check console for details.");
        } finally {
            setIsUploading(false); // Hide progress bar after upload completes
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center">Add New Game</h2>

            <div className="card p-4 shadow-sm">
                <div className="mb-3">
                    <label className="form-label">Game Name</label>
                    <input type="text" className="form-control" name="name" onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Region</label>
                    <input type="text" className="form-control" name="region" onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Genre</label>
                    <input type="text" className="form-control" name="genre" onChange={handleChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" name="description" rows="3" onChange={handleChange}></textarea>
                </div>
                <div className="mb-3">
                    <label className="form-label">Upload Game File</label>
                    <input type="file" className="form-control" ref={fileInputRef} onChange={handleFileChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Upload Game Picture</label>
                    <input type="file" className="form-control" onChange={handleGamePictureChange} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Upload Gameplay Picture</label>
                    <input type="file" className="form-control" onChange={handleGameplayPictureChange} />
                </div>

                {/* ✅ Progress Bar */}
                {isUploading && (
                    <div className="progress mt-3">
                        <div 
                            className="progress-bar progress-bar-striped progress-bar-animated" 
                            role="progressbar" 
                            style={{ width: `${uploadProgress}%` }}>
                            {uploadProgress}%
                        </div>
                    </div>
                )}

                <button className="btn btn-success w-100 mt-3" onClick={handleSubmit} disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Submit"}
                </button>
            </div>
        </div>
    );
}
