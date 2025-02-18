import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./admin/Login";
import Dashboard from "./admin/Dashboard";
import CustomerLogin from "./customer/CustomerLogin";
import CustomerDashboard from "./customer/CustomerDashboard";
import CustomerPreview from "./customer/CustomerPreview";
import AddGame from "./admin/AddGame";
import EditGame from "./admin/EditGame";
import GamePreview from "./admin/GamePreview";
import Landing from "./Landing";

export default function AuthWrapper({ token, setToken }) {
    const navigate = useNavigate(); // ✅ useNavigate is now inside a Router

    // ✅ Auto Logout After 1 Hour
    useEffect(() => {
        const checkTokenExpiration = () => {
            const tokenExpiry = localStorage.getItem("tokenExpiry");
            if (tokenExpiry && Date.now() > Number(tokenExpiry)) {
                console.log("🔴 Token Expired. Logging Out...");
                logoutUser();
            }
        };

        const logoutUser = () => {
            localStorage.removeItem("token");
            localStorage.removeItem("tokenExpiry");
            setToken("");
            navigate("/login");
        };

        const interval = setInterval(checkTokenExpiration, 60 * 1000); // Check every minute

        return () => clearInterval(interval); // Cleanup on unmount
    }, [navigate, setToken]);

    return (
        <Routes>
            {/* 🔹 Admin Routes */}
            <Route path="/admin/login" element={<Login setToken={setToken} />} />
            <Route path="/admin/dashboard" element={token ? <Dashboard token={token} /> : <Login setToken={setToken} />} />
            <Route path="/admin/add-game" element={token ? <AddGame token={token} /> : <Login setToken={setToken} />} />
            <Route path="/admin/edit-game/:id" element={token ? <EditGame token={token} /> : <Login setToken={setToken} />} />
            <Route path="/admin/preview/:id" element={token ? <GamePreview token={token} /> : <Login setToken={setToken} />} />

            {/* 🔹 Customer Routes */}
            <Route path="/login" element={<CustomerLogin setToken={setToken} />} />
            <Route path="/dashboard" element={token ? <CustomerDashboard token={token} /> : <CustomerLogin setToken={setToken} />} />
            <Route path="/preview/:id" element={token ? <CustomerPreview token={token} /> : <CustomerLogin setToken={setToken} />} />

            {/* 🔹 Default Route */}
            <Route path="/" element={<Landing />} />
        </Routes>
    );
}
