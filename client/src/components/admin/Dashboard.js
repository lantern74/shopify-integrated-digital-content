import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import '../../App.css'

export default function Dashboard({ token, selectedCategory }) {
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
            const apiUrl = process.env.REACT_APP_API_URL;
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

    useEffect(() => {
        filterGames();
    }, [selectedCategory, searchQuery, games]);

    const filterGames = () => {
        let filtered = games;

        if (selectedCategory !== "All") {
            filtered = filtered.filter(game => game.category === selectedCategory);
        }

        if (searchQuery.trim()) {
            filtered = filtered.filter(game =>
                game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                game.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
                game.genre.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredGames(filtered);
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
    
    // ✅ Handle Delete
    const handleDelete = async (e, gameId) => {
        e.stopPropagation();
        e.preventDefault(); 
        if (!window.confirm("Are you sure you want to delete this content?")) return;
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            await axios.delete(`${apiUrl}/api/games/${gameId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Content deleted successfully!");
            fetchGames(); // Refresh list
        } catch (error) {
            console.error("❌ Delete Error:", error);
            alert("Failed to delete content.");
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
        <div className="dashboard-container">
            <div  className="d-flex align-center justify-content-between">
                <h2 className="title">Admin Content Management</h2>
                <div className="actions">
                    <Link to="/admin/add-game" className="game-add-btn">+ Add</Link>
                </div>
            </div>

            {/* 🔍 Search Bar */}
            <input
                type="text"
                className="search-bar"
                placeholder={`🔍 Search by Name, Region, or Genre in ${selectedCategory} Category`}
                value={searchQuery}
                onChange={handleSearch}
            />

            <div className="game-grid">
                {filteredGames.length === 0 ? (
                    <p className="no-results">No found. Try a different search!</p>
                ) : (
                    filteredGames.map((game) => (
                        <div key={game._id} className="game-card">
                            <Link to={`/admin/preview/${game._id}`}>
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
                                    <Link to={`/admin/edit-game/${game._id}`} className="btn btn-sm d-flex align-items-center justify-content-center" title="Edit">
                                        <i className="bi bi-pencil-square"></i>
                                    </Link>
                                    <button onClick={(e) => handleDelete(e, game._id)} className="btn btn-sm d-flex align-items-center justify-content-center" title="Delete">
                                        <i className="bi bi-trash"></i>
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
