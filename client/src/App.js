import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; 
import Login from "./components/admin/Login";
import Dashboard from "./components/admin/Dashboard";
import CustomerLogin from "./components/CustomerLogin";
import CustomerDashboard from "./components/CustomerDashboard";
import { jwtDecode } from "jwt-decode";
import AddGame from "./components/admin/AddGame";
import EditGame from "./components/admin/EditGame";

function App() {
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [role, setRole] = useState("");

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setRole(decoded.role || "");
            } catch (error) {
                console.error("❌ Invalid Token:", error);
                setToken("");
                localStorage.removeItem("token");
            }
        }
    }, [token]);

    return (
        <Router>
            <Navbar token={token} setToken={setToken} role={role} /> 

            <Routes>
                {/* Admin Routes */}
                <Route path="/admin/login" element={<Login setToken={setToken} />} />
                <Route path="/admin/dashboard" element={token && role === "admin" ? <Dashboard token={token} /> : <Login setToken={setToken} />} />
                <Route path="/admin/add-game" element={token && role === "admin" ? <AddGame token={token} /> : <Dashboard setToken={setToken} />} />
                <Route path="/admin/edit-game/:id" element={token && role === "admin" ? <EditGame token={token} /> : <Login setToken={setToken} />} />

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
