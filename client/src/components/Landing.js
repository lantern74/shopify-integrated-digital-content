import { useState, useEffect } from "react";
import axios from "axios";

export default function Landing({ selectedCategory, setSelectedCategory, token }) {
    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [errorMessage, setErrorMessage] = useState(""); // ✅ State for error message

    const apiUrl = process.env.REACT_APP_API_URL;

    // ✅ Update `isMobile` on window resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ✅ Fetch games only once when component mounts
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
                    : game.downloadLink,
            }));

            setGames(gamesWithImages);
            setFilteredGames(gamesWithImages);
        } catch (error) {
            console.error("🔴 Error Fetching Games:", error);
        }
    };

    // ✅ Re-filter games when category or search query changes
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
            setFilteredGames(games);
            return;
        }

        const filtered = games.filter(game =>
            game.name.toLowerCase().includes(query) ||
            game.region.toLowerCase().includes(query) ||
            game.genre.toLowerCase().includes(query)
        );

        setFilteredGames(filtered);
    };

    // ✅ Function to handle category selection
    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    // ✅ Function to handle game card click
    const handleGameClick = () => {
        if (!token) {
            setErrorMessage("You have to login now!");
            setTimeout(() => setErrorMessage(""), 3000); // Clear message after 3 seconds
        } else {
            console.log("✅ Navigating to game details...");
        }
    };

    return (
        <div className="dashboard-container">
            <h2 className="text-center title">Welcome To Visit Our Digital Content Libraries</h2>

            {/* 🔍 Search Bar */}
            <input
                type="text"
                className="search-bar"
                placeholder={`🔍 Search by Name, Region, or Genre in ${selectedCategory} Category`}
                value={searchQuery}
                onChange={handleSearch}
            />

            {/* ✅ Show category buttons below the search bar in mobile view */}
            {isMobile && (
                <div className="category-buttons">
                    <button className={`categoryBtn ${selectedCategory === "All" ? "active" : ""}`} onClick={() => handleCategoryClick("All")}>ALL</button>
                    <button className={`categoryBtn ${selectedCategory === "GAMES" ? "active" : ""}`} onClick={() => handleCategoryClick("GAMES")}>GAMES</button>
                    <button className={`categoryBtn ${selectedCategory === "MOVIES" ? "active" : ""}`} onClick={() => handleCategoryClick("MOVIES")}>MOVIES</button>
                    <button className={`categoryBtn ${selectedCategory === "EBOOTS" ? "active" : ""}`} onClick={() => handleCategoryClick("EBOOTS")}>EBOOTS</button>
                    <button className={`categoryBtn ${selectedCategory === "MISC" ? "active" : ""}`} onClick={() => handleCategoryClick("MISC")}>MISC</button>
                </div>
            )}

            {/* ❌ Error Message */}
            {errorMessage && <div className="error-message text-center">{errorMessage}</div>}

            <div className="game-grid">
                {filteredGames.length === 0 ? (
                    <p className="no-results">No games found. Try a different search!</p>
                ) : (
                    filteredGames.map((game) => (
                        <div key={game._id} className="game-card" onClick={handleGameClick} style={{cursor:'pointer'}}>
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
