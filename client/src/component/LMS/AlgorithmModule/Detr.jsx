import React, { useState } from "react";
import FeedbackForm from "../FeedBackForm";

const Detr = () => {
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [selectedFileType, setSelectedFileType] = useState("pdf");
    const [feedback, setFeedback] = useState([]);

    // DETR files - only PDF and IPYNB
    const detrFiles = [
        {
            id: 1,
            title: "DETR Documentation",
            fileId: "1qSi67nkaGrnkXPIvCZHqUxDMwhPGO3tu", // Replace with actual PDF ID
            type: "pdf",
            icon: "📄"
        },
        {
            id: 2,
            title: "DETR Notebook",
            fileId: "1dR2mZcLsf0ynDAln4DtzI3_p2BDCtKw8", // Replace with actual IPYNB ID
            type: "ipynb",
            icon: "📓"
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
        localStorage.setItem("userFeedback", JSON.stringify(updatedFeedback));
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

    // Set first file as default on load
    useState(() => {
        if (detrFiles.length > 0 && !selectedFileId) {
            setSelectedFileId(detrFiles[0].fileId);
            setSelectedFileType(detrFiles[0].type);
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
            {/* Slim sidebar */}
            <div className="w-56 bg-gray-800 text-white p-4 border-r border-gray-700">
                <h2 className="text-lg font-semibold mb-4">DETR Materials</h2>
                <ul className="space-y-2">
                    {detrFiles.map((file) => (
                        <li key={file.id}>
                            <button
                                onClick={() => {
                                    setSelectedFileId(file.fileId);
                                    setSelectedFileType(file.type);
                                }}
                                className={`flex items-center hover:bg-gray-700 p-2 rounded w-full text-left ${
                                    selectedFileId === file.fileId ? "bg-gray-700" : ""
                                }`}
                            >
                                <span className="mr-2">{file.icon}</span>
                                <span>{file.title}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main content area */}
            <div className="flex-1 p-4 flex flex-col">
                <h1 className="text-3xl font-bold mb-6 text-center">DETR (Detection Transformer)</h1>
                
                {selectedFileId && (
                    <>
                        <div className="w-full h-[80vh] border rounded-lg shadow-lg overflow-hidden relative"
                            onContextMenu={(e) => e.preventDefault()}>
                            {/* Block Google Drive's pop-out button */}
                            <div className="absolute top-0 right-0 w-12 h-12 z-10" />
                            
                            <iframe
                                key={`${selectedFileId}-${selectedFileType}`}
                                src={getEmbedURL(selectedFileId, selectedFileType)}
                                className="w-full h-full"
                                allowFullScreen
                                title="DETR Content Viewer"
                            />
                        </div>
                        
                        <div className="mt-4 w-full max-w-2xl mx-auto">
                            <FeedbackForm
                                fileId={selectedFileId}
                                onSubmit={handleFeedbackSubmit}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// Feedback submission handler
const sendFeedbackToServer = (feedback) => {
    // Implement your actual feedback submission here
    console.log("Feedback to be sent:", feedback);
};

export default Detr;