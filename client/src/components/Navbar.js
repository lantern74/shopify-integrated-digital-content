import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

export default function Navbar({ token, setToken, role }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Remove token from storage
        localStorage.removeItem("token");

        // Reset authentication state
        setToken("");

        // Redirect to login page
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg px-5 py-4 d-flex justify-content-end">
            {/* <Link to={"/"}>
                <img src="/gameLogo.jpg" alt="Logo" width={150} height={70}></img>
            </Link> */}
            <div className="ml-auto">
                {token ? (
                    // Use a button instead of <Link> to properly handle logout
                    <button className="signBtn" onClick={handleLogout}>Logout</button>
                ) : (
                    <Link className="signBtn" to="/login">Login</Link>
                )}
            </div>
        </nav>
    );
}
