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
        <div className="container mt-5">
            <h2>Customer Login</h2>
            <input type="email" className="form-control" placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <input type="text" className="form-control mt-2" placeholder="Order ID" onChange={e => setOrderId(e.target.value)} />
            <button className="btn btn-primary mt-2" onClick={handleLogin}>Login</button>
        </div>
    );
}
