import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function CustomerLogin({ setToken }) {
    const [email, setEmail] = useState("");
    const [orderNumber, setOrderNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const apiUrl = process.env.REACT_APP_API_URL;

    const handleLogin = async () => {
        setErrorMessage(""); // Clear previous error
        if (!email.trim() || !orderNumber.trim()) {
            setErrorMessage("Email and Order ID are required.");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${apiUrl}/api/customers/login`, { email, orderNumber });

            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
                const expirationTime = Date.now() + 60 * 60 * 1000;
                localStorage.setItem("tokenExpiry", expirationTime.toString());
    
                const decoded = jwtDecode(res.data.token);
                setTimeout(() => {
                    navigate(decoded.role === "customer" ? "/dashboard" : "/");
                }, 500);

                setToken(res.data.token);
            } else {
                setErrorMessage("Login failed. Please check your email or order number.");
            }
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Login failed. Please check your email or order number."
            );
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Customer Access</h2>
                <p>Enter your email and order number to unlock full access</p>

                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                <div className="input-group">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label>Order Number</label>
                    <input
                        type="text"
                        placeholder="Enter your Order Number"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                    />
                </div>

                <button className="login-button" onClick={handleLogin} disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </div>
        </div>
    );
}
