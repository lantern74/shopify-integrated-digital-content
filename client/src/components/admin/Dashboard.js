import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Dashboard({ token }) {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]); // For filtering in the frontend
    const [searchQuery, setSearchQuery] = useState("");

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
            setFilteredGames(gamesWithImages); // Initialize filteredGames with all games
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

    // 🔍 Handle Search Input
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (!query.trim()) {
            setFilteredGames(games); // Reset to original list if search is empty
            return;
        }

        // Filter games in frontend
        const filtered = games.filter(game =>
            game.name.toLowerCase().includes(query) ||
            game.region.toLowerCase().includes(query) ||
            game.genre.toLowerCase().includes(query)
        );

        setFilteredGames(filtered);
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center">Admin Game Management</h2>
            <div className="text-end">
                <Link to="/admin/add-game" className="btn btn-primary mb-3">+ Add Game</Link>
            </div>

            {/* 🔍 Search Bar */}
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Search by Name, Region, or Genre..."
                value={searchQuery}
                onChange={handleSearch}
            />

            <div className="row mt-4">
                {filteredGames.length === 0 ? (
                    <p className="text-center">No games found. Try a different search!</p>
                ) : (
                    filteredGames.map((game) => (
                        <div key={game._id} className="col-md-4 col-sm-6">
                            <div className="card shadow-sm mb-3">
                                <img src={game.gamePictureUrl} className="card-img-top" alt={game.name} style={{ height: "200px", objectFit: "cover" }} />
                                
                                <div className="card-body">
                                    <h5>{game.name}</h5>
                                    <div><strong>Genre:</strong> {game.genre}</div>
                                    <div><strong>Region:</strong> {game.region}</div>
                                    
                                    {/* Action Buttons */}
                                    <div className="mt-3 d-flex justify-content-between">
                                        <a href={game.fileDownloadUrl} className="btn btn-success btn-sm d-flex align-items-center justify-content-center" download title="Download">
                                            <i className="bi bi-download"></i> {/* Bootstrap Icon */}
                                        </a>
                                        <Link to={`/admin/edit-game/${game._id}`} className="btn btn-warning btn-sm d-flex align-items-center justify-content-center" title="Edit">
                                            <i className="bi bi-pencil-square"></i>
                                        </Link>
                                        <button onClick={() => handleDelete(game._id)} className="btn btn-danger btn-sm d-flex align-items-center justify-content-center" title="Delete">
                                            <i className="bi bi-trash"></i>
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
