import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CustomerPreview({ token }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);

    const apiUrl = process.env.REACT_APP_API_URL;
    useEffect(() => {
        if (!token) {
            navigate("/dashboard");
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
        <>
        <div className="preview-container">
            <button className="back-preview" onClick={() => navigate(-1)}><i class="bi bi-caret-left"></i>Back</button>

            <div>
                <h3 className="text-center mb-3">{game.name}</h3>

                {/* Game Picture */}
                <div className="text-center">
                    <img src={game.gamePictureUrl} className="img-fluid rounded" alt={game.name} style={{ width: "100%", objectFit: "cover" }} />
                </div>

                <div className="mt-4">
                    <div className="preview-subtext">Genre</div>
                    <div className="preview-text">{game.genre}</div>
                    <div className="preview-subtext">Region</div>
                    <div className="preview-text">{game.region}</div>
                    <div className="preview-subtext">Description</div>
                    <div className="preview-text">{game.description}</div>
                </div>

                {/* Gameplay Pictures */}
                {game.gameplayPictureUrls.length > 0 && (
                    <div className="mt-3">
                        <div className="preview-subtext">Game Screenshots</div>
                        <div className="d-flex flex-wrap mt-3">
                            {game.gameplayPictureUrls.map((url, index) => (
                                <img key={index} src={url} alt="Gameplay" className="me-2 mb-2 rounded" style={{ width: "120px", height: "120px", objectFit: "cover" }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Download Button */}
                <div className="mt-4 text-center">
                    <a href={game.fileDownloadUrl} className="btn preview-download-btn btn-lg d-flex align-items-center justify-content-center gap-2" download title="Download">
                        <i className="bi bi-download"></i><span>Download Game</span>
                    </a>
                </div>
            </div>
        </div>
        </>
    );
}
