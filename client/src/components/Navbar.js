import React, {useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

export default function Navbar({ token, setToken, role, selectedCategory, setSelectedCategory }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogIn = () => {
        navigate("/login");
        setIsOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken("");
        navigate("/login");
        setIsOpen(false);
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        navigate("/");
        setIsOpen(false); // ✅ Close menu after clicking a category
    };

    return (
        <nav className="navbar navbar-expand-lg px-5 py-4">
            {/* Hamburger Menu Icon */}
            <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
                ☰
            </button>
            {/* Navbar Links (Hidden on mobile, shows when clicked) */}
            <div className={`nav-links ${isOpen ? "show" : ""}`}>
                {isOpen? (
                    <button className="close-btn" onClick={() => setIsOpen(false)}><i class="bi bi-x"></i></button>
                ) : (
                    <Link to={"/"} style={{width: '100px'}}></Link>
                )}
                <div className="category-buttons">
                    <button className={`signBtn ${selectedCategory === "All" ? "active" : ""}`} onClick={() => handleCategoryClick("All")}>All</button>
                    <button className={`signBtn ${selectedCategory === "Games" ? "active" : ""}`} onClick={() => handleCategoryClick("Games")}>Games</button>
                    <button className={`signBtn ${selectedCategory === "Movies" ? "active" : ""}`} onClick={() => handleCategoryClick("Movies")}>Movies</button>
                    <button className={`signBtn ${selectedCategory === "Images" ? "active" : ""}`} onClick={() => handleCategoryClick("Images")}>Images</button>
                    <button className={`signBtn ${selectedCategory === "Documents" ? "active" : ""}`} onClick={() => handleCategoryClick("Documents")}>Documents</button>
                </div>
                <div>
                    {token ? (
                        // Use a button instead of <Link> to properly handle logout
                        <button className="signBtn" onClick={handleLogout}>Logout</button>
                    ) : (
                        <button className="signBtn" onClick={handleLogIn}>Login</button>
                    )}
                </div>
            </div>
        </nav>
    );
}
