import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
    // State to hold the token
    const [token, setToken] = useState(localStorage.getItem("token") || "");

    return (
        <Router>
            <Routes>
                <Route path="/admin/login" element={<Login setToken={setToken} />} />
                <Route path="/admin/dashboard" element={token ? <Dashboard token={token} /> : <Login setToken={setToken} />} />
                <Route path="/" element={<h1 className="text-center mt-5">Welcome to Admin Panel</h1>} />
            </Routes>
        </Router>
    );
}

export default App;
