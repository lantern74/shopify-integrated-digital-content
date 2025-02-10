import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login({ setToken }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });

            console.log("✅ Login Successful! Response:", res.data);

            if (!res.data.token) {
                throw new Error("Token not received");
            }

            setToken(res.data.token);
            localStorage.setItem("token", res.data.token);
            navigate("/admin/dashboard");
        } catch (error) {
            alert("Login failed! Check console for details.");
        }
    };

    return (
        <div className="container d-flex align-items-center justify-content-center min-vh-100">
            <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
                <h2 className="text-center mb-4">Admin Login</h2>
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
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Enter your password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary w-100" onClick={handleLogin}>
                    Login
                </button>
            </div>
        </div>
    );
}
