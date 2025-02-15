import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

export default function CustomerDashboard({ token }) {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]); // For filtering in the frontend
    const [searchQuery, setSearchQuery] = useState("");

    const apiUrl = process.env.REACT_APP_API_URL;
    useEffect(() => {
        if (!token) {
            navigate("/");
        } else {
            fetchGames();
        }
    }, [token]);

    const fetchGames = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/games`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const gamesWithImages = res.data.map((game) => ({
                ...game,
                gamePictureUrl: game.gamePicture
                    ? `${apiUrl}/api/files/image/${game.gamePicture}`
                    : "/placeholder.jpg",
                gameplayPictureUrls: game.gameplayPictures
                    ? game.gameplayPictures.map(id => `${apiUrl}/api/files/image/${id}`)
                    : [],
                fileDownloadUrl: game.fileUrl
                    ? `${apiUrl}/api/files/download/${game.fileUrl}`
                    : "#",
            }));

            setGames(gamesWithImages);
            setFilteredGames(gamesWithImages); // Initialize filteredGames with all games
        } catch (error) {
            console.error("🔴 Error Fetching Games:", error);
        }
    };

    const handleDownload = (e, fileUrl) => {
        e.stopPropagation();
        e.preventDefault(); 
    
        if (!fileUrl || fileUrl === "#") {
            alert("Download link is missing!");
            return;
        }
    
        const link = document.createElement("a");
        link.href = fileUrl;
        link.setAttribute("download", ""); // Forces download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        <div className="dashboard-container">
            <h2 className="text-center title">Game Contents</h2>

            {/* 🔍 Search Bar */}
            <input
                type="text"
                className="search-bar"
                placeholder="🔍 Search by Game Name, Region, or Genre..."
                value={searchQuery}
                onChange={handleSearch}
            />

            <div className="game-grid">
                {filteredGames.length === 0 ? (
                    <p className="no-results">No games found. Try a different search!</p>
                ) : (
                    filteredGames.map((game) => (
                        <div key={game._id} className="game-card">
                            <Link to={`/preview/${game._id}`}>
                                <img src={game.gamePictureUrl} alt={game.name} className="game-img" />
                                <div className="game-info">
                                    <h5>{game.name}</h5>
                                    <div>
                                        <div><strong>Genre:</strong> {game.genre}</div>
                                        <div><strong>Region:</strong> {game.region}</div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="game-actions">
                                    <button
                                        className="btn btn-success btn-sm d-flex align-items-center justify-content-center"
                                        onClick={(e) => handleDownload(e, game.fileDownloadUrl)} // 🛠️ Pass event to stop propagation
                                        title="Download"
                                    >
                                        <i className="bi bi-download"></i>
                                    </button>
                                </div>
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
