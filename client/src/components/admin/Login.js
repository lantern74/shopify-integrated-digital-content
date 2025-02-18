// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "../../App.css"; // Import the CSS file for styling

// export default function Login({ setToken }) {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [errorMessage, setErrorMessage] = useState(""); // State for error messages
//     const navigate = useNavigate();
//     const apiUrl = process.env.REACT_APP_API_URL;

//     const handleLogin = async () => {
//         setErrorMessage(""); // Clear previous errors

//         if (!email.trim() || !password.trim()) {
//             setErrorMessage("Email and Password are required.");
//             return;
//         }

//         try {
//             const res = await axios.post(`${apiUrl}/api/auth/login`, { email, password });

//             console.log("✅ Login Successful! Response:", res.data);

//             if (!res.data.token) {
//                 throw new Error("Token not received");
//             }

//             // Store token in localStorage first
//             localStorage.setItem("token", res.data.token);

//             const expirationTime = Date.now() + 60 * 60 * 1000;
//             localStorage.setItem("tokenExpiry", expirationTime.toString());

//             setToken(res.data.token); // Update state

//             // ✅ Wait for token update before navigating
//             setTimeout(() => {
//                 navigate("/admin/dashboard");
//             }, 500);
//         } catch (error) {
//             setErrorMessage(
//                 error.response?.data?.message || "Login failed! Please check your email or password."
//             );
//         }
//     };

//     return (
//         <div className="login-container">
//             <div className="login-box">
//                 <h2>Admin Login</h2>

//                 {/* Display error message if exists */}
//                 {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

//                 <div className="input-group">
//                     <label>Email</label>
//                     <input
//                         type="email"
//                         placeholder="Enter your email"
//                         onChange={(e) => setEmail(e.target.value)}
//                     />
//                 </div>

//                 <div className="input-group">
//                     <label>Password</label>
//                     <input
//                         type="password"
//                         placeholder="Enter your password"
//                         onChange={(e) => setPassword(e.target.value)}
//                     />
//                 </div>

//                 <button className="login-button" onClick={handleLogin}>
//                     Login
//                 </button>
//             </div>
//         </div>
//     );
// }

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../../App.css";

export default function Login({ setToken }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(""); 
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;

    const handleLogin = async () => {
        setErrorMessage("");

        if (!email.trim() || !password.trim()) {
            setErrorMessage("Email and Password are required.");
            return;
        }

        try {
            const res = await axios.post(`${apiUrl}/api/auth/login`, { email, password });

            if (!res.data.token) {
                throw new Error("Token not received");
            }

            localStorage.setItem("token", res.data.token);
            const expirationTime = Date.now() + 60 * 60 * 1000;
            localStorage.setItem("tokenExpiry", expirationTime.toString());

            setToken(res.data.token);

            const decoded = jwtDecode(res.data.token);
            setTimeout(() => {
                navigate(decoded.role === "admin" ? "/admin/dashboard" : "/dashboard");
            }, 500);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || "Login failed! Please check your email or password."
            );
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Admin Login</h2>
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                <div className="input-group">
                    <label>Email</label>
                    <input type="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="input-group">
                    <label>Password</label>
                    <input type="password" placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button className="login-button" onClick={handleLogin}>Login</button>
            </div>
        </div>
    );
}
