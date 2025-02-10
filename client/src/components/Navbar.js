import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ token, setToken, role }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken("");
        navigate("/");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-4 d-flex justify-content-between">
            <Link className="navbar-brand" to="/">📚 Digital Content Library</Link>

            <div className="ml-auto">
                {token ? (
                    <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                ) : (
                    <Link className="btn btn-primary" to="/login">Login</Link>
                )}
            </div>
        </nav>
    );
}
