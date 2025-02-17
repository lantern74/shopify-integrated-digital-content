import { useState, useEffect } from "react";
import axios from "axios";

export default function Landing({selectedCategory}) {
    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/games`); // ✅ No authentication required

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
            <h2 className="text-center title">Welcome To Visit Our Digital Content Libraries</h2>

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
                            <img src={game.gamePictureUrl} alt={game.name} className="game-img" />
                            <div className="game-info">
                                <h5>{game.name}</h5>
                                <div>
                                    <div><strong>Genre:</strong> {game.genre}</div>
                                    <div><strong>Region:</strong> {game.region}</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
