// import React, { useState, useEffect } from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Navbar from "./components/Navbar"; 
// import Login from "./components/admin/Login";
// import Dashboard from "./components/admin/Dashboard";
// import CustomerLogin from "./components/customer/CustomerLogin";
// import CustomerDashboard from "./components/customer/CustomerDashboard";
// import CustomerPreview from "./components/customer/CustomerPreview";
// import { jwtDecode } from "jwt-decode";
// import AddGame from "./components/admin/AddGame";
// import EditGame from "./components/admin/EditGame";
// import GamePreview from "./components/admin/GamePreview";
// import Landing from "./components/Landing";
// import "./App.css";
// import Footer from "./components/Footer";

// function App() {
//     const [token, setToken] = useState(localStorage.getItem("token") || "");
//     const [role, setRole] = useState("");
//     const [loading, setLoading] = useState(
//         sessionStorage.getItem("hasLoaded") ? false : true
//     );
//     const [selectedCategory, setSelectedCategory] = useState("All");

//     useEffect(() => {
//         if (token) {
//             try {
//                 const decoded = jwtDecode(token);
//                 setRole(decoded.role || "");
//             } catch (error) {
//                 console.error("❌ Invalid Token:", error);
//                 setToken("");
//                 localStorage.removeItem("token");
//             }
//         }
//     }, [token]);

//     // Show loading screen only once when the website initially loads
//     useEffect(() => {
//         if (loading) {
//             setTimeout(() => {
//                 setLoading(false);
//                 sessionStorage.setItem("hasLoaded", "true"); // Store that the site has loaded
//             }, 5000);
//         }
//     }, [loading]);

//     return (
//         <Router>
//             {loading ? (
//                 // 🔥 Full-Screen Loading Animation (Only on First Load)
//                 <div className="loading-screen">
//                     <h1 className="loading-text">
//                         Loading
//                         <span className="dot1">.</span>
//                         <span className="dot2">.</span>
//                         <span className="dot3">.</span>
//                     </h1>
//                 </div>
//             ) : (
//                 <div className="landing">
//                     <Navbar token={token} setToken={setToken} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} role={role} /> 
//                     <Routes>
//                         {/* Admin Routes */}
//                         <Route path="/admin/login" element={<Login setToken={setToken} />} />
//                         <Route path="/admin/dashboard" element={token && role === "admin" ? <Dashboard token={token} selectedCategory={selectedCategory}/> : <Login setToken={setToken} />} />
//                         <Route path="/admin/add-game" element={token && role === "admin" ? <AddGame token={token} /> : <Dashboard setToken={setToken} selectedCategory={selectedCategory}/>} />
//                         <Route path="/admin/edit-game/:id" element={token && role === "admin" ? <EditGame token={token} /> : <Dashboard setToken={setToken} selectedCategory={selectedCategory}/>} />
//                         <Route path="/admin/preview/:id" element={token && role === "admin" ? <GamePreview token={token} /> : <Dashboard setToken={setToken} selectedCategory={selectedCategory}/>} />

//                         {/* Customer Routes */}
//                         <Route path="/login" element={<CustomerLogin setToken={setToken} />} />
//                         <Route path="/dashboard" element={token && role === "customer" ? <CustomerDashboard token={token} selectedCategory={selectedCategory}/> : <CustomerLogin setToken={setToken} />} />
//                         <Route path="/preview/:id" element={token && role === "customer" ? <CustomerPreview token={token} /> : <CustomerDashboard setToken={setToken} selectedCategory={selectedCategory}/>} />

//                         {/* Default Route */}
//                         <Route path="/" element={<Landing selectedCategory={selectedCategory}/>} />
//                     </Routes>
//                     <Footer />
//                 </div>
//             )}
//         </Router>
//     );
// }

// export default App;

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar"; 
import Login from "./components/admin/Login";
import Dashboard from "./components/admin/Dashboard";
import CustomerLogin from "./components/customer/CustomerLogin";
import CustomerDashboard from "./components/customer/CustomerDashboard";
import CustomerPreview from "./components/customer/CustomerPreview";
import { jwtDecode } from "jwt-decode";
import AddGame from "./components/admin/AddGame";
import EditGame from "./components/admin/EditGame";
import GamePreview from "./components/admin/GamePreview";
import Landing from "./components/Landing";
import "./App.css";
import Footer from "./components/Footer";

function App() {
    const navigate = useNavigate();
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(sessionStorage.getItem("hasLoaded") ? false : true);
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const tokenExpiry = localStorage.getItem("tokenExpiry");

                if (!tokenExpiry || Date.now() > parseInt(tokenExpiry, 10)) {
                    console.warn("Token expired");
                    handleLogout();
                } else {
                    setRole(decoded.role || "");
                }
            } catch (error) {
                console.error("❌ Invalid Token:", error);
                handleLogout();
            }
        }
    }, [token]);

    const handleLogout = () => {
        setToken("");
        setRole("");
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiry");
        navigate("/login"); // Redirect to login page after logout
    };

    useEffect(() => {
        if (loading) {
            setTimeout(() => {
                setLoading(false);
                sessionStorage.setItem("hasLoaded", "true");
            }, 5000);
        }
    }, [loading]);

    useEffect(() => {
        // Prevent access to login page if already authenticated
        if (token && (window.location.pathname === "/admin/login" || window.location.pathname === "/login")) {
            navigate(role === "admin" ? "/admin/dashboard" : "/dashboard");
        }
    }, [token, role, navigate]);

    return (
        <div>
            {loading ? (
                <div className="loading-screen">
                    <h1 className="loading-text">
                        Loading
                        <span className="dot1">.</span>
                        <span className="dot2">.</span>
                        <span className="dot3">.</span>
                    </h1>
                </div>
            ) : (
                <div className="landing">
                    <Navbar 
                        token={token} 
                        setToken={setToken} 
                        selectedCategory={selectedCategory} 
                        setSelectedCategory={setSelectedCategory} 
                        role={role} 
                        onLogout={handleLogout}
                    />
                    <Routes>
                        {/* Admin Routes */}
                        <Route path="/admin/login" element={!token ? <Login setToken={setToken} /> : <Dashboard token={token} selectedCategory={selectedCategory} />} />
                        <Route path="/admin/dashboard" element={token && role === "admin" ? <Dashboard token={token} selectedCategory={selectedCategory}/> : <Login setToken={setToken} />} />
                        <Route path="/admin/add-game" element={token && role === "admin" ? <AddGame token={token} /> : <Dashboard token={token} selectedCategory={selectedCategory}/>} />
                        <Route path="/admin/edit-game/:id" element={token && role === "admin" ? <EditGame token={token} /> : <Dashboard token={token} selectedCategory={selectedCategory}/>} />
                        <Route path="/admin/preview/:id" element={token && role === "admin" ? <GamePreview token={token} /> : <Dashboard token={token} selectedCategory={selectedCategory}/>} />

                        {/* Customer Routes */}
                        <Route path="/login" element={!token ? <CustomerLogin setToken={setToken} /> : <CustomerDashboard token={token} selectedCategory={selectedCategory} />} />
                        <Route path="/dashboard" element={token && role === "customer" ? <CustomerDashboard token={token} selectedCategory={selectedCategory}/> : <CustomerLogin setToken={setToken} />} />
                        <Route path="/preview/:id" element={token && role === "customer" ? <CustomerPreview token={token} /> : <CustomerDashboard setToken={setToken} selectedCategory={selectedCategory}/>} />

                        {/* Default Route */}
                        <Route path="/" element={<Landing selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />} />
                    </Routes>
                    <Footer />
                </div>
            )}
        </div>
    );
}

export default App;
