import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function Footer({ isFixed }) {
    return (
        <footer className={`${isFixed ? "fixFooter" : "footer"}`}>
            <div className="footer-container">
                <p className="footer-text">© {new Date().getFullYear()} <a href="https://psp.games" target="_blank" style={{textDecoration:'none', color:'white'}}>PSP.GAMES</a>. All rights reserved.</p>
                <p className="footer-text">This is a private digital library dedicated to preserving retro gaming history.</p>
                <p className="footer-text">We are not affiliated with Sony, PlayStation, or any other game publishers.</p>
            </div>
        </footer>
    );
}
