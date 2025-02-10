import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import CustomerLogin from "./components/CustomerLogin";
import CustomerDashboard from "./components/CustomerDashboard";
import { jwtDecode } from "jwt-decode"; // ✅ Correct import

function App() {
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [role, setRole] = useState(""); // State to store user role

    // Decode token and determine user role
    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setRole(decoded.role || ""); // Ensure role exists
            } catch (error) {
                console.error("❌ Invalid Token:", error);
                setToken("");
                localStorage.removeItem("token");
            }
        }
    }, [token]);

    return (
        <Router>
            <Routes>
                {/* Admin Routes */}
                <Route path="/admin/login" element={<Login setToken={setToken} />} />
                <Route path="/admin/dashboard" element={token && role === "admin" ? <Dashboard token={token} /> : <Login setToken={setToken} />} />

                {/* Customer Routes */}
                <Route path="/login" element={<CustomerLogin setToken={setToken} />} />
                <Route path="/dashboard" element={token && role === "customer" ? <CustomerDashboard token={token} /> : <CustomerLogin setToken={setToken} />} />

                {/* Default Route */}
                <Route path="/" element={<h1 className="text-center mt-5">Welcome to Digital Content Library</h1>} />
            </Routes>
        </Router>
    );
}

export default App;
