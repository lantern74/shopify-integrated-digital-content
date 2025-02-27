import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import '../../App.css'

export default function Dashboard({ token, selectedCategory, setSelectedCategory }) {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]); // For filtering in the frontend
    const [searchQuery, setSearchQuery] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [currentPage, setCurrentPage] = useState(1);
    const [gamesPerRow, setGamesPerRow] = useState(7);

    useEffect(() => {
        const updateGamesPerRow = () => {
            const width = window.innerWidth;
            if (width > 1600) setGamesPerRow(7);
            else if (width > 1500) setGamesPerRow(6);
            else if (width > 1250) setGamesPerRow(5);
            else if (width > 1000) setGamesPerRow(4);
            else if (width > 750) setGamesPerRow(3);
            else setGamesPerRow(2);
        };

        updateGamesPerRow(); // Initial setup
        window.addEventListener("resize", updateGamesPerRow);
        return () => window.removeEventListener("resize", updateGamesPerRow);
    }, []);

    // ✅ Update `isMobile` on window resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    
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
                    : game.downloadLink,
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
        setCurrentPage(1);
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
    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    const gamesPerPage = gamesPerRow * 4; // Always 4 rows per page
    const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
    const paginatedGames = filteredGames.slice((currentPage - 1) * gamesPerPage, currentPage * gamesPerPage);
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // ✅ Generate Pagination Numbers with "..."
    const getPaginationItems = () => {
        const maxPagesToShow = 5;
        let pages = [];

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total pages are small
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            // Show first, last, current, and nearby pages with "..."
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="dashboard-container">
            <div  className="admin-header">
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
            <div className="game-grid">
                {paginatedGames.length === 0 ? (
                    <p className="no-results">No results found. Try a different search!</p>
                ) : (
                    paginatedGames.map((game) => (
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
            
            {/* Pagination Controls */}
            <div className="pagination">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="page-btn"><i className="bi bi-arrow-left"></i></button>

                {getPaginationItems().map((page, index) => (
                    <button
                        key={index}
                        className={`page-number ${currentPage === page ? "active" : ""}`}
                        onClick={() => typeof page === "number" && handlePageChange(page)}
                        disabled={page === "..."}
                    >
                        {page}
                    </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="page-btn"><i className="bi bi-arrow-right"></i></button>
            </div>
        </div>
    );
}
