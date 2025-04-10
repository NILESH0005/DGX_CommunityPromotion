import React, { useState } from "react";
import FeedbackForm from "../FeedBackForm";

const Resnet50 = () => {
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [selectedFileType, setSelectedFileType] = useState("pdf");
    const [feedback, setFeedback] = useState([]);

    // ResNet50 files
    const resnetFiles = [
        {
            id: 1,
            title: "ResNet50 Documentation",
            fileId: "1GWAmSutHzKjJvTVun9VLLrOjubaIwqOk", // Replace with actual PDF ID
            type: "pdf",
            icon: "📄"
        },
        {
            id: 2,
            title: "ResNet50 Implementation",
            fileId: "1WQaIchi7RaepQL9dLSunE_383JA2v8JJ", // Replace with actual IPYNB ID
            type: "ipynb",
            icon: "📓"
        }
    ];

    const handleFeedbackSubmit = (fileId, rating, comment) => {
        const newFeedback = {
            fileId,
            rating,
            comment,
            timestamp: new Date().toISOString()
        };
        const updatedFeedback = [...feedback, newFeedback];
        localStorage.setItem("resnetFeedback", JSON.stringify(updatedFeedback));
        setFeedback(updatedFeedback);
        sendFeedbackToServer(newFeedback);
    };

    const getEmbedURL = (fileId, type) => {
        switch(type) {
            case "pdf":
                return `https://drive.google.com/file/d/${fileId}/preview`;
            case "ipynb":
                return `https://nbviewer.jupyter.org/urls/docs.google.com/uc?export=download&id=${fileId}`;
            default:
                return "";
        }
    };

    // Initialize first file and set up security
    useState(() => {
        if (resnetFiles.length > 0 && !selectedFileId) {
            setSelectedFileId(resnetFiles[0].fileId);
            setSelectedFileType(resnetFiles[0].type);
        }

        const disableRightClick = (e) => e.preventDefault();
        const disableShortcuts = (e) => {
            if (e.ctrlKey && (e.key === 's' || e.key === 'p')) e.preventDefault();
        };

        document.addEventListener('contextmenu', disableRightClick);
        document.addEventListener('keydown', disableShortcuts);

        return () => {
            document.removeEventListener('contextmenu', disableRightClick);
            document.removeEventListener('keydown', disableShortcuts);
        };
    }, []);

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Navigation Sidebar */}
            <div className="w-56 bg-gray-800 text-white p-4 border-r border-gray-700">
                <h2 className="text-lg font-semibold mb-4">ResNet50 Resources</h2>
                <ul className="space-y-2">
                    {resnetFiles.map(file => (
                        <li key={file.id}>
                            <button
                                onClick={() => {
                                    setSelectedFileId(file.fileId);
                                    setSelectedFileType(file.type);
                                }}
                                className={`flex items-center w-full p-2 rounded text-left hover:bg-gray-700 ${
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

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col p-4">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    ResNet50 Deep Learning Model
                </h1>
                
                {selectedFileId && (
                    <>
                        <div className="w-full h-[80vh] border rounded-lg shadow-lg relative overflow-hidden"
                            onContextMenu={(e) => e.preventDefault()}>
                            {/* Block Google Drive pop-out button */}
                            <div className="absolute top-0 right-0 w-12 h-12 z-10" />
                            
                            <iframe
                                key={`${selectedFileId}-${Date.now()}`}
                                src={getEmbedURL(selectedFileId, selectedFileType)}
                                className="w-full h-full"
                                allowFullScreen
                                title="ResNet50 Content Viewer"
                            />
                        </div>

                        <div className="mt-6 w-full max-w-2xl mx-auto">
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

const sendFeedbackToServer = (feedback) => {
    // Implement your feedback submission logic
    console.log("Submitting feedback:", feedback);
    // Example: axios.post('/api/feedback/resnet', feedback)
};

export default Resnet50;