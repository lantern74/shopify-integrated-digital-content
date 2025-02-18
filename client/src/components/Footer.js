import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <p className="footer-text">© {new Date().getFullYear()} YourCompany. All rights reserved.</p>
            </div>
        </footer>
    );
}
