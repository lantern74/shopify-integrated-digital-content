import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
                setToken(res.data.token);
                localStorage.setItem("token", res.data.token);
                navigate("/dashboard");
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
                <h2>Customer Login</h2>

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
