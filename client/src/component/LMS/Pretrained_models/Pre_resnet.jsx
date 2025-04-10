import React, { useState, useEffect } from "react";
import FeedbackForm from "../FeedBackForm";

const Pre_resnet = () => {
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [selectedFileType, setSelectedFileType] = useState("pdf");
    const [isDownloading, setIsDownloading] = useState(false);
    const [feedback, setFeedback] = useState([]);

    // Pre-ResNet files
    const preResnetFiles = [
        {
            id: 1,
            title: "ResNet Guide (PDF)",
            fileId: "1j4-WIz0YJnqTAS4Eh3VuFbXPrJUxQEfL", // Replace with actual PDF ID
            type: "pdf",
            icon: "📄",
            description: "Implementation guide for ResNet"
        },
        {
            id: 2,
            title: "Training Notebook (IPYNB)",
            fileId: "1FAYpq27JJoK3ZYtkbiuZmOhfoPKI3MpZ", // Replace with actual notebook ID
            type: "ipynb",
            icon: "📓",
            description: "Jupyter notebook with training code"
        },
        {
            id: 3,
            title: "Pre-trained Weights (H5)",
            fileId: "1Qr7MY5wMpCCRnb9XokJDx2mXRIgvE9f0/", // Replace with actual weights file ID
            type: "h5",
            icon: "⚖️",
            description: "Pre-trained model weights",
            size: "~90MB" // Example size
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
        localStorage.setItem("preResnetFeedback", JSON.stringify(updatedFeedback));
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
            link.setAttribute('download', fileName || 'resnet_weights.h5');
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
        if (preResnetFiles.length > 0 && !selectedFileId) {
            const firstFile = preResnetFiles.find(f => f.type !== "h5");
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
                <h2 className="text-lg font-semibold mb-4">Pre-ResNet Materials</h2>
                <ul className="space-y-2">
                    {preResnetFiles.map((file) => (
                        <li key={file.id}>
                            {file.type === "h5" ? (
                                <button
                                    onClick={() => handleDownload(file.fileId, 'resnet_weights.h5')}
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
                <h1 className="text-3xl font-bold mb-6 text-center">Pre-ResNet Preparation</h1>
                
                {selectedFileType === "h5" ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
                            <div className="text-6xl mb-4">⚖️</div>
                            <h2 className="text-2xl font-semibold mb-2">Model Weights Download</h2>
                            <p className="text-gray-600 mb-4">Click the download button in the sidebar to get the weights file</p>
                            <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                                <h3 className="font-medium mb-2">File Information:</h3>
                                <ul className="text-sm space-y-1">
                                    <li>• Format: HDF5 (.h5)</li>
                                    <li>• Contains: Pre-trained weights</li>
                                    <li>• Size: ~90MB</li>
                                    <li>• Framework: TensorFlow/Keras</li>
                                </ul>
                            </div>
                            <button
                                onClick={() => handleDownload(preResnetFiles[2].fileId, 'resnet_weights.h5')}
                                disabled={isDownloading}
                                className={`px-4 py-2 rounded-lg font-medium text-white ${
                                    isDownloading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                                } transition-colors`}
                            >
                                {isDownloading ? 'Downloading...' : 'Download Weights'}
                            </button>
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
                                title={preResnetFiles.find(f => f.fileId === selectedFileId)?.title || "Content Viewer"}
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
    // Example: axios.post('/api/feedback/pre-resnet', feedback)
};

export default Pre_resnet;