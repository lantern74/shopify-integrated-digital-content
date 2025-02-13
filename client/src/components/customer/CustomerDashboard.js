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
            <h2 className="text-center mb-5">Game Contents</h2>

            {/* 🔍 Search Bar */}
            <input
                type="text"
                className="form-control mb-3"
                placeholder="🔍 Search by Game Name, Region, or Genre..."
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
                                <Link to={`/preview/${game._id}`}>
                                    <img 
                                        src={game.gamePictureUrl} 
                                        className="card-img-top" 
                                        alt={game.name} 
                                        style={{ height: "200px", objectFit: "cover", cursor: "pointer" }} 
                                    />
                                </Link>
                                
                                <div className="card-body">
                                    <h5>{game.name}</h5>
                                    <div><strong>Genre:</strong> {game.genre}</div>
                                    <div><strong>Region:</strong> {game.region}</div>
                                    
                                    {/* Download Button */}
                                    <div className="mt-3 d-flex justify-content-center">
                                        <a href={game.fileDownloadUrl} className="btn btn-success btn-sm d-flex align-items-center justify-content-center gap-2" download title="Download">
                                            <i className="bi bi-download"></i><span>Download</span>
                                        </a>
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
