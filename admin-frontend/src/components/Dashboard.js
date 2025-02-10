import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../App.css'

export default function Dashboard({ token }) {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!token) {
            navigate("/admin/login");
        } else {
            fetchFiles();
        }
    }, [token]);

    const fetchFiles = () => {
        axios.get("http://localhost:5000/api/files", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setFiles(res.data))
        .catch((error) => {
            console.error("🔴 Error Fetching Files:", error);
            localStorage.removeItem("token");
        });
    };

    const handleFileChange = (event) => {
        setSelectedFiles([...event.target.files]);
    };

    const handleUpload = async () => {
        if (!selectedFiles.length) {
            alert("Please select at least one file.");
            return;
        }

        const formData = new FormData();
        selectedFiles.forEach(file => formData.append("files", file));

        try {
            await axios.post("http://localhost:5000/api/files/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            alert("Files uploaded successfully!");
            setSelectedFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchFiles();
        } catch (error) {
            console.error("Upload Error:", error);
            alert("File upload failed!");
        }
    };

    const handleDownload = async (fileId, filename) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/files/download/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob",
            });

            const blob = new Blob([response.data], { type: response.headers["content-type"] });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("❌ Download Error:", error);
            alert("File download failed!");
        }
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm("Are you sure you want to delete this file?")) {
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/api/files/delete/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            fetchFiles();
        } catch (error) {
            console.error("❌ Delete Error:", error);
            alert("File deletion failed!");
        }
    };

    // 🔍 Filter files based on search query
    const filteredFiles = files.filter(file => 
        file.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ✅ Function to determine the correct file type icon
    const getFileIcon = (filename) => {
        const fileExtension = filename.split(".").pop().toLowerCase();
        const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg"];
        const pdfExtensions = ["pdf"];
        const docExtensions = ["doc", "docx", "txt", "rtf"];
        const videoExtensions = ["mp4", "mkv", "avi", "mov", "flv", "webm"];
        const audioExtensions = ["mp3", "wav", "aac", "ogg"];

        if (imageExtensions.includes(fileExtension)) {
            return <i className="bi bi-file-image text-info file-icon"></i>;
        } else if (pdfExtensions.includes(fileExtension)) {
            return <i className="bi bi-file-pdf text-danger file-icon"></i>;
        } else if (docExtensions.includes(fileExtension)) {
            return <i className="bi bi-file-text text-primary file-icon"></i>;
        } else if (videoExtensions.includes(fileExtension)) {
            return <i className="bi bi-file-play text-warning file-icon"></i>;
        } else if (audioExtensions.includes(fileExtension)) {
            return <i className="bi bi-file-music text-success file-icon"></i>;
        }
        return <i className="bi bi-file-earmark text-secondary file-icon"></i>;
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center">Admin File Management</h2>

            {/* File Upload Section */}
            <div className="card p-4 shadow-sm">
                <h4>Upload Files</h4>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="form-control mb-3"
                    onChange={handleFileChange}
                />
                <button className="btn btn-success w-100" onClick={handleUpload}>Upload</button>
            </div>

            {/* File List Section */}
            <h4 className="mt-4">Uploaded Files</h4>

            {/* Search Bar */}
            <input
                type="text"
                className="form-control mb-3"
                placeholder="🔍 Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            <ul className="list-group">
                {filteredFiles.map(file => (
                    <li key={file._id} className="list-group-item d-flex align-items-center justify-content-between flex-wrap">
                        <div className="d-flex align-items-center">
                            {getFileIcon(file.filename)}

                            <span className="file-name">{file.filename}</span>
                        </div>

                        <div className="button-group">
                            <button 
                                className="btn btn-primary btn-sm mx-2" 
                                onClick={() => handleDownload(file._id, file.filename)}
                            >
                                Download
                            </button>
                            <button 
                                className="btn btn-danger btn-sm mx-2" 
                                onClick={() => handleDelete(file._id)}
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
