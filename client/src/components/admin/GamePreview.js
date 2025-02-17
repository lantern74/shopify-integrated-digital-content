import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function GamePreview({ token }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);

    const apiUrl = process.env.REACT_APP_API_URL;
    useEffect(() => {
        if (!token) {
            navigate("/admin/dashboard");
        } else {
            fetchGameDetails();
        }
    }, [token]);

    const fetchGameDetails = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/games/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const gameData = res.data;
            setGame({
                ...gameData,
                gamePictureUrl: gameData.gamePicture
                    ? `${apiUrl}/api/files/image/${gameData.gamePicture}`
                    : "/placeholder.jpg",
                gameplayPictureUrls: gameData.gameplayPictures
                    ? gameData.gameplayPictures.map(picId => `${apiUrl}/api/files/image/${picId}`)
                    : [],
                fileDownloadUrl: gameData.fileUrl
                    ? `${apiUrl}/api/files/download/${gameData.fileUrl}`
                    : "#",
            });

            setLoading(false);
        } catch (error) {
            console.error("❌ Error Fetching Game Details:", error);
            navigate("/"); // Redirect if game is not found
        }
    };

    if (loading) return <p className="text-center mt-5">Loading game details...</p>;

    return (
        <div className="preview-container">
            {/* 🔙 Back Button */}
            <button className="back-preview" onClick={() => navigate(-1)}>
                <i className="bi bi-caret-left"></i> Back
            </button>

            <div className="preview-content">
                {/* 🎮 Game Title */}
                <h2 className="game-title">{game.name}</h2>

                {/* 🖼️ Game Cover */}
                <div className="game-cover">
                    <img src={game.gamePictureUrl} alt={game.name} />
                </div>

                {/* 🎭 Game Details */}
                <div className="game-details">
                    <div className="detail-box">
                        <div className="detail-label">
                            <i className="bi bi-controller" style={{fontSize:'18px'}}></i> Category
                        </div>
                        <div className="detail-value">{game.category}</div>
                    </div>
                    
                    <div className="detail-box">
                        <div className="detail-label">
                            <i className="bi bi-tags" style={{fontSize:'18px'}}></i> Genre
                        </div>
                        <div className="detail-value">{game.genre}</div>
                    </div>
                    
                    <div className="detail-box">
                        <div className="detail-label">
                            <i className="bi bi-globe" style={{fontSize:'18px'}}></i> Region
                        </div>
                        <div className="detail-value">{game.region}</div>
                    </div>
                    
                    <div className="detail-box">
                        <div className="detail-label">
                            <i className="bi bi-file-text" style={{fontSize:'18px'}}></i> Description
                        </div>
                        <p className="detail-value">{game.description}</p>
                    </div>
                </div>

                {/* 📸 Gameplay Screenshots */}
                {game.gameplayPictureUrls.length > 0 && (
                    <div className="screenshots">
                        <h3 className="screenshot-title">Screenshots</h3>
                        <div className="screenshot-gallery">
                            {game.gameplayPictureUrls.map((url, index) => (
                                <img key={index} src={url} alt="Gameplay" className="screenshot-img" />
                            ))}
                        </div>
                    </div>
                )}

                {/* 📥 Download Button */}
                <div className="download-section">
                    <a href={game.fileDownloadUrl} className="download-btn" download>
                        <i className="bi bi-download"></i> Download
                    </a>
                </div>
            </div>
        </div>
    );
}
