import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CustomerLogin({ setToken }) {
    const [email, setEmail] = useState("");
    const [orderId, setOrderId] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.post("http://localhost:5000/api/customers/login", { email, orderId });
            setToken(res.data.token);
            localStorage.setItem("token", res.data.token);
            navigate("/dashboard");
        } catch (error) {
            alert("Login failed. Please check your email or order number.");
        }
    };

    return (
        <div className="container d-flex align-items-center justify-content-center" style={{ height: "calc(100vh - 56px)" }}>
            <div className="card shadow-lg p-4" style={{ maxWidth: "500px", width: "100%" }}>
                <h2 className="text-center mb-4">Customer Login</h2>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Enter your email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Order ID</label>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Enter your Order ID"
                        onChange={(e) => setOrderId(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary w-100" onClick={handleLogin}>
                    Login
                </button>
            </div>
        </div>
    );
}
