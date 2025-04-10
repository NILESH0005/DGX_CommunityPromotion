import React, { useState, useEffect } from "react";
import FeedbackForm from "../FeedBackForm";

const Pre_detr = () => {
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [selectedFileType, setSelectedFileType] = useState("pdf");
    const [isDownloading, setIsDownloading] = useState(false);
    const [feedback, setFeedback] = useState([]);

    // Pre-DETR files
    const preDetrFiles = [
        {
            id: 1,
            title: "Pre-DETR Guide (PDF)",
            fileId: "1JF2V3YpDATDaxmZVH2okoD5N92ireQnc", // Replace with actual PDF ID
            type: "pdf",
            icon: "📄",
            description: "Preparation guide for DETR implementation"
        },
        {
            id: 2,
            title: "Pre-Processing Notebook (IPYNB)",
            fileId: "Y1PXz4IWYG5r70oyR30vU0tQNHvWawu0xG", // Replace with actual notebook ID
            type: "ipynb",
            icon: "📓",
            description: "Jupyter notebook with data preprocessing steps"
        },
        {
            id: 3,
            title: "Dataset (TAR)",
            fileId: "1g368MTzqE0xmUdsp0HTR2dZGzpe0nFaU", // Replace with actual TAR ID
            type: "tar",
            icon: "📦",
            description: "Compressed dataset for DETR preparation",
            size: "~150MB" // Example size
        }
    ];

    const handleFeedbackSubmit = (fileId, rating, comment) => {
        const newFeedback = {
            fileId,
            rating,
            comment,
            timestamp: new Date().toISOString(),
        };
        const updatedFeedback = [...feedback, newFeedback];
        localStorage.setItem("preDetrFeedback", JSON.stringify(updatedFeedback));
        setFeedback(updatedFeedback);
        sendFeedbackToServer(newFeedback);
    };

    const getEmbedURL = (fileId, type) => {
        switch (type) {
            case "pdf":
                return `https://drive.google.com/file/d/${fileId}/preview`;
            case "ipynb":
                return `https://nbviewer.jupyter.org/urls/docs.google.com/uc?export=download&id=${fileId}`;
            default:
                return "";
        }
    };

    const handleDownload = async (fileId, fileName) => {
        setIsDownloading(true);
        try {
            // First get the confirmation token for large files
            const response = await fetch(`https://drive.google.com/uc?export=download&id=${fileId}`);
            const html = await response.text();
            
            // Parse the confirmation token from the response
            const matches = html.match(/confirm=([^&]+)/);
            const confirmToken = matches ? matches[1] : null;
            
            // Create the final download URL
            const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmToken}`;
            
            // Create temporary anchor element
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', fileName || 'dataset.tar');
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    // Set first file as default on component mount
    useEffect(() => {
        if (preDetrFiles.length > 0 && !selectedFileId) {
            const firstFile = preDetrFiles.find(f => f.type !== "tar");
            if (firstFile) {
                setSelectedFileId(firstFile.fileId);
                setSelectedFileType(firstFile.type);
            }
        }

        // Security measures
        const disableRightClick = (e) => e.preventDefault();
        const disableKeys = (e) => {
            if (e.ctrlKey && (e.key === 's' || e.key === 'p')) e.preventDefault();
        };

        document.addEventListener('contextmenu', disableRightClick);
        document.addEventListener('keydown', disableKeys);

        return () => {
            document.removeEventListener('contextmenu', disableRightClick);
            document.removeEventListener('keydown', disableKeys);
        };
    }, []);

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white p-4 border-r border-gray-700">
                <h2 className="text-lg font-semibold mb-4">Pre-DETR Materials</h2>
                <ul className="space-y-2">
                    {preDetrFiles.map((file) => (
                        <li key={file.id}>
                            {file.type === "tar" ? (
                                <button
                                    onClick={() => handleDownload(file.fileId, 'detr_dataset.tar')}
                                    disabled={isDownloading}
                                    className={`flex items-center w-full p-3 rounded text-left hover:bg-gray-700 ${
                                        isDownloading ? 'bg-gray-600' : ''
                                    }`}
                                >
                                    <span className="mr-3 text-lg">{file.icon}</span>
                                    <div>
                                        <div className="font-medium">{file.title}</div>
                                        <div className="text-xs text-gray-300 mt-1">{file.description}</div>
                                        <div className="text-xs text-gray-400 mt-1">Size: {file.size}</div>
                                    </div>
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setSelectedFileId(file.fileId);
                                        setSelectedFileType(file.type);
                                    }}
                                    className={`flex items-center w-full p-3 rounded text-left hover:bg-gray-700 ${
                                        selectedFileId === file.fileId ? "bg-gray-700" : ""
                                    }`}
                                >
                                    <span className="mr-3 text-lg">{file.icon}</span>
                                    <div>
                                        <div className="font-medium">{file.title}</div>
                                        <div className="text-xs text-gray-300 mt-1">{file.description}</div>
                                    </div>
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 flex flex-col">
                <h1 className="text-3xl font-bold mb-6 text-center">Pre-DETR Preparation</h1>
                
                {selectedFileType === "tar" ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
                            <div className="text-6xl mb-4">📦</div>
                            <h2 className="text-2xl font-semibold mb-2">Dataset Download</h2>
                            <p className="text-gray-600 mb-4">Click the download button in the sidebar to get the TAR file</p>
                            <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                                <h3 className="font-medium mb-2">File Information:</h3>
                                <ul className="text-sm space-y-1">
                                    <li>• Format: TAR Archive</li>
                                    <li>• Contains: Training dataset</li>
                                    <li>• Size: ~150MB</li>
                                    <li>• Contents: Images and annotations</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : selectedFileId ? (
                    <>
                        <div className="flex-1 w-full border rounded-xl shadow-lg overflow-hidden relative bg-white"
                            onContextMenu={(e) => e.preventDefault()}>
                            {/* Block Google Drive's pop-out button */}
                            <div className="absolute top-0 right-0 w-12 h-12 z-10" />
                            
                            <iframe
                                key={`${selectedFileId}-${selectedFileType}`}
                                src={getEmbedURL(selectedFileId, selectedFileType)}
                                className="w-full h-full"
                                allowFullScreen
                                title={preDetrFiles.find(f => f.fileId === selectedFileId)?.title || "Content Viewer"}
                            />
                        </div>

                        <div className="mt-6 w-full max-w-2xl mx-auto">
                            <FeedbackForm
                                fileId={selectedFileId}
                                onSubmit={handleFeedbackSubmit}
                            />
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};

const sendFeedbackToServer = (feedback) => {
    // Implement your feedback submission logic here
    console.log("Submitting feedback:", feedback);
    // Example: axios.post('/api/feedback/pre-detr', feedback)
};

export default Pre_detr;