import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import FeedbackForm from "../FeedBackForm";

const DeepSpeech = () => {
    const navigate = useNavigate();
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [selectedFileType, setSelectedFileType] = useState("pdf");
    const [feedback, setFeedback] = useState([]);

    // DeepSpeech files
    const deepSpeechFiles = [
        {
            id: 1,
            title: "DeepSpeech Documentation",
            fileId: "1hUz_72VxUZmQNW2Pyd0-GrgjBWNEwlqJ", // Replace with your PDF file ID
            type: "pdf"
        },
        {
            id: 2,
            title: "DeepSpeech Notebook",
            fileId: "1TrikRjxiop2kQ_xQye1H06HYy8Pz0V_o", // Replace with your IPYNB file ID
            type: "ipynb"
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

    const getEmbedURL = (fileId, type = "pdf") => {
        switch (type) {
            case "pdf":
                return `https://drive.google.com/file/d/${fileId}/preview`;
            case "ipynb":
                // For IPYNB files, we'll use nbviewer
                return `https://nbviewer.jupyter.org/urls/docs.google.com/uc?export=download&id=${fileId}`;
            default:
                return "";
        }
    };

    // Set default file on initial render
    useState(() => {
        if (deepSpeechFiles.length > 0 && !selectedFileId) {
            setSelectedFileId(deepSpeechFiles[0].fileId);
            setSelectedFileType(deepSpeechFiles[0].type);
        }

        const disableRightClick = (e) => {
            e.preventDefault();
        };

        const disableKeyboardShortcuts = (e) => {
            if (e.ctrlKey && (e.key === 's' || e.key === 'p')) {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', disableRightClick);
        document.addEventListener('keydown', disableKeyboardShortcuts);

        return () => {
            document.removeEventListener('contextmenu', disableRightClick);
            document.removeEventListener('keydown', disableKeyboardShortcuts);
        };
    }, []);

    const handleFileSelect = (fileId, type) => {
        setSelectedFileId(fileId);
        setSelectedFileType(type);
    };

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white p-4 border-r border-gray-700">
                <h2 className="text-lg font-semibold mb-4">DeepSpeech Resources</h2>
                <ul className="space-y-2">
                    {deepSpeechFiles.map((file) => (
                        <li key={file.id}>
                            <button
                                onClick={() => handleFileSelect(file.fileId, file.type)}
                                className={`flex items-center hover:bg-gray-700 hover:text-white p-2 rounded w-full text-left ${
                                    selectedFileId === file.fileId ? "bg-gray-700 text-white" : ""
                                }`}
                            >
                                <span className="mr-2">
                                    {file.type === "pdf" ? "📄" : "📓"}
                                </span>
                                <span>{file.title}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-4 flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4 text-center">DeepSpeech Materials</h1>
                {selectedFileId && (
                    <div className="w-full max-w-7xl h-[90vh] border rounded-lg shadow overflow-hidden relative"
                        onContextMenu={(e) => e.preventDefault()}>
                        {/* Transparent overlay to block the pop-out button */}
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                width: "50px",
                                height: "50px",
                                backgroundColor: "transparent",
                                zIndex: 10,
                            }}
                        />
                        <iframe
                            key={selectedFileId}
                            src={getEmbedURL(selectedFileId, selectedFileType)}
                            className="w-full h-full"
                            allowFullScreen
                        />
                    </div>
                )}
                {selectedFileId && (
                    <FeedbackForm
                        fileId={selectedFileId}
                        onSubmit={handleFeedbackSubmit}
                    />
                )}
            </div>
        </div>
    );
};

// Helper function to send feedback to server
const sendFeedbackToServer = (feedback) => {
    // Implement your feedback submission logic here
    console.log("Feedback submitted:", feedback);
};

export default DeepSpeech;