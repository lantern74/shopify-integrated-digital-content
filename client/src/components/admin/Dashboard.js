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
                    ? `http://localhost:5000/api/files/image/${game.gamePicture}`
                    : "/placeholder.jpg",
                gameplayPictureUrls: game.gameplayPictures
                    ? game.gameplayPictures.map(id => `http://localhost:5000/api/files/image/${id}`)
                    : [],
                fileDownloadUrl: game.fileUrl
                    ? `http://localhost:5000/api/files/download/${game.fileUrl}`
                    : "#",
            }));

            setGames(gamesWithImages);
        } catch (error) {
            console.error("🔴 Error Fetching Games:", error);
        }
    };

    // ✅ Handle Delete
    const handleDelete = async (gameId) => {
        if (!window.confirm("Are you sure you want to delete this game?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/games/${gameId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Game deleted successfully!");
            fetchGames(); // Refresh list
        } catch (error) {
            console.error("❌ Delete Error:", error);
            alert("Failed to delete game.");
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center">Admin Game Management</h2>
            <div className="text-end">
                <Link to="/admin/add-game" className="btn btn-primary mb-3">+ Add Game</Link>
            </div>

            <div className="row mt-4">
                {games.length === 0 ? (
                    <p className="text-center">No games found. Add a new game!</p>
                ) : (
                    games.map((game) => (
                        <div key={game._id} className="col-md-4 col-sm-6">
                            <div className="card shadow-sm mb-3">
                                <img src={game.gamePictureUrl} className="card-img-top" alt={game.name} style={{ height: "200px", objectFit: "cover" }} />
                                
                                <div className="card-body">
                                    <h5>{game.name}</h5>
                                    <p><strong>Genre:</strong> {game.genre}</p>
                                    <p><strong>Region:</strong> {game.region}</p>
                                    
                                    {/* Gameplay Images - Display Multiple */}
                                    <div className="d-flex mt-2">
                                        {game.gameplayPictureUrls.map((url, index) => (
                                            <img key={index} src={url} className="me-2" alt="Gameplay" style={{ width: "50px", height: "50px", objectFit: "cover" }} />
                                        ))}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-3">
                                        <a href={game.fileDownloadUrl} className="btn btn-success btn-sm w-100 mb-2" download>
                                            Download Game
                                        </a>
                                        <Link to={`/admin/edit-game/${game._id}`} className="btn btn-warning btn-sm w-100 mb-2">
                                            ✏ Edit
                                        </Link>
                                        <button onClick={() => handleDelete(game._id)} className="btn btn-danger btn-sm w-100">
                                            🗑 Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
