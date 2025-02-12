import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function GamePreview({ token }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            navigate("/admin/dashboard");
        } else {
            fetchGameDetails();
        }
    }, [token]);

    const fetchGameDetails = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/games/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const gameData = res.data;
            setGame({
                ...gameData,
                gamePictureUrl: gameData.gamePicture
                    ? `http://localhost:5000/api/files/image/${gameData.gamePicture}`
                    : "/placeholder.jpg",
                gameplayPictureUrls: gameData.gameplayPictures
                    ? gameData.gameplayPictures.map(picId => `http://localhost:5000/api/files/image/${picId}`)
                    : [],
                fileDownloadUrl: gameData.fileUrl
                    ? `http://localhost:5000/api/files/download/${gameData.fileUrl}`
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
        <div className="container mt-4">
            <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>⬅ Back</button>

            <div>
                <h2 className="text-center mb-5">{game.name}</h2>

                {/* Game Picture */}
                <div className="text-center">
                    <img src={game.gamePictureUrl} className="img-fluid rounded" alt={game.name} style={{ maxHeight: "800px", objectFit: "cover" }} />
                </div>

                <div className="mt-5">
                    <p><strong>Genre:</strong> {game.genre}</p>
                    <p><strong>Region:</strong> {game.region}</p>
                    <p><strong>Description:</strong> {game.description}</p>
                </div>

                {/* Gameplay Pictures */}
                {game.gameplayPictureUrls.length > 0 && (
                    <div className="mt-5">
                        <h5>Gameplay Screenshots</h5>
                        <div className="d-flex flex-wrap mt-3">
                            {game.gameplayPictureUrls.map((url, index) => (
                                <img key={index} src={url} alt="Gameplay" className="me-2 mb-2 rounded" style={{ width: "120px", height: "120px", objectFit: "cover" }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Download Button */}
                <div className="mt-4 text-center">
                    <a href={game.fileDownloadUrl} className="btn btn-success btn-lg d-flex align-items-center justify-content-center gap-2" download title="Download">
                        <i className="bi bi-download"></i><span>Download Game</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
