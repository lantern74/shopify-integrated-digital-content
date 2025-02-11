import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Dashboard({ token }) {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);

    useEffect(() => {
        if (!token) {
            navigate("/admin/login");
        } else {
            fetchGames();
        }
    }, [token]);

    const fetchGames = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/games", {
                headers: { Authorization: `Bearer ${token}` }
            });

            const gamesWithImages = res.data.map((game) => ({
                ...game,
                gamePictureUrl: game.gamePicture
                    ? `http://localhost:5000/api/files/image/${game.gamePicture}` // ✅ Use new image route
                    : "/placeholder.jpg",
                gameplayPictureUrl: game.gameplayPicture
                    ? `http://localhost:5000/api/files/image/${game.gameplayPicture}`
                    : "/placeholder.jpg",
                fileDownloadUrl: game.fileUrl
                    ? `http://localhost:5000/api/files/download/${game.fileUrl}`
                    : "#",
            }));

            setGames(gamesWithImages);
        } catch (error) {
            console.error("🔴 Error Fetching Games:", error);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center">Admin Game Management</h2>
            <div className="text-end">
                <Link to="/admin/add-game" className="btn btn-primary mb-3">+ Add Game</Link>
            </div>

            <div className="row mt-4">
                {games.map((game) => (
                    <div key={game._id} className="col-md-4 col-sm-6">
                        <div className="card shadow-sm mb-3">
                            <img src={game.gamePictureUrl} className="card-img-top" alt={game.name} style={{height: '200px'}} />
                            <div className="card-body">
                                <h5>{game.name}</h5>
                                <p><strong>Genre:</strong> {game.genre}</p>
                                <p><strong>Region:</strong> {game.region}</p>
                                <a href={game.fileDownloadUrl} className="btn btn-success btn-sm w-100" download>
                                    Download Game
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
