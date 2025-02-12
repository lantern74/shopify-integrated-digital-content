import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CustomerDashboard({ token }) {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);

    useEffect(() => {
        if (!token) {
            navigate("/");
        } else {
            fetchFiles();
        }
    }, [token]);

    const fetchFiles = () => {
        axios.get("http://localhost:5000/api/files", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setFiles(res.data))
        .catch(() => {
            localStorage.removeItem("token");
            navigate("/");
        });
    };

    return (
        <div className="container mt-5">
            <h2>My Downloads</h2>
            <ul className="list-group">
                {files.map(file => (
                    <li key={file._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{file.filename}</span>
                        <a href={`http://localhost:5000/api/files/download/${file._id}`} className="btn btn-success btn-sm">
                            Download
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
