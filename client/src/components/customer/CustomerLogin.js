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
            setToken(res.data.token);
            localStorage.setItem("token", res.data.token);
            navigate("/dashboard");
        } catch (error) {
            setErrorMessage("Login failed. Please check your email or order number.");
        }
        setLoading(false);
    };

    return (
        <div className="container d-flex align-items-center justify-content-center" style={{ height: "calc(100vh - 56px)" }}>
            <div className="card shadow-lg p-4" style={{ maxWidth: "500px", width: "100%" }}>
                <h2 className="text-center mb-4">Customer Login</h2>

                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Order Number</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter your Order Number"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary w-100" onClick={handleLogin} disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </div>
        </div>
    );
}
