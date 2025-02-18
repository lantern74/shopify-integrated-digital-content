import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

export default function Navbar({ token, setToken, role, selectedCategory, setSelectedCategory }) {
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleLogIn = () => {
        navigate("/login");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken("");
        navigate("/login");
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    return (
        <nav className="navbar navbar-expand-lg">
            <div className="navClass">
                <Link to="/"><img src="/thumb_IMG_0881.png" alt="logo" className="logo" /></Link>

                {!isMobile && (
                    <div className="category-buttons">
                        <button className={`signBtn ${selectedCategory === "All" ? "active" : ""}`} onClick={() => handleCategoryClick("All")}>ALL</button>
                        <button className={`signBtn ${selectedCategory === "GAMES" ? "active" : ""}`} onClick={() => handleCategoryClick("GAMES")}>GAMES</button>
                        <button className={`signBtn ${selectedCategory === "MOVIES" ? "active" : ""}`} onClick={() => handleCategoryClick("MOVIES")}>MOVIES</button>
                        <button className={`signBtn ${selectedCategory === "EBOOTS" ? "active" : ""}`} onClick={() => handleCategoryClick("EBOOTS")}>EBOOTS</button>
                        <button className={`signBtn ${selectedCategory === "MISC" ? "active" : ""}`} onClick={() => handleCategoryClick("MISC")}>MISC</button>
                    </div>
                )}

                <div className="auth-section">
                    {token ? (
                        <button className="signBtn" onClick={handleLogout}>Logout</button>
                    ) : (
                        <button className="signBtn" onClick={handleLogIn}>Login</button>
                    )}
                </div>
            </div>
        </nav>
    );
}
