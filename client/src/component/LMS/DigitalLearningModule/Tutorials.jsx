import React, { useState, useEffect } from "react";
import FeedbackForm from "../FeedBackForm";

const Tutorials = () => {
    const [selectedVideoId, setSelectedVideoId] = useState(null);
    const [selectedVideoTitle, setSelectedVideoTitle] = useState("");
    const [feedback, setFeedback] = useState([]);

    // Tutorial videos data
    const tutorialVideos = [
        {
            id: 1,
            title: "Artificial Intelligence Tutorial",
            fileId: "1GHPX9neaLZrs484zk2jF11msR6ADBbMa", // Replace with actual Google Drive file ID
            duration: "32:15",
            description: "Introduction to fundamental AI concepts"
        },
        {
            id: 2,
            title: "Convolutional Neural Networks Explained",
            fileId: "XaUrSyoYCKjpDgqO4c6G4gAn3jtZv56p",
            duration: "28:42",
            description: "Understanding CNNs for image processing"
        },
        {
            id: 3,
            title: "Deep Learning Crash Course",
            fileId: "1MoZ-CgCAIIeCxeroA6-Woaj1PpRgMpEH",
            duration: "45:30",
            description: "Comprehensive deep learning overview"
        },
        {
            id: 4,
            title: "Machine Learning Crash Course",
            fileId: "1LvvCE3k8ubVQvmtIzVoU-gsu4_z06jEF",
            duration: "38:55",
            description: "Essential ML concepts and techniques"
        },
        {
            id: 5,
            title: "Neural Network Explained",
            fileId: "10OTiefIKXQIaXb7sOPIsSZvYDCnyUq_6",
            duration: "25:18",
            description: "Fundamentals of neural networks"
        },
        {
            id: 6,
            title: "Recurrent Neural Network Explained",
            fileId: "1B00MK2-ZnW3PT_dySsEVjUy6dPBc4OJh",
            duration: "31:27",
            description: "Understanding RNNs for sequence data"
        }
    ];

    const handleFeedbackSubmit = (fileId, rating, comment) => {
        const newFeedback = {
            fileId,
            rating,
            comment,
            timestamp: new Date().toISOString(),
            videoTitle: selectedVideoTitle
        };
        const updatedFeedback = [...feedback, newFeedback];
        localStorage.setItem("tutorialsFeedback", JSON.stringify(updatedFeedback));
        setFeedback(updatedFeedback);
        sendFeedbackToServer(newFeedback);
    };

    const getVideoUrl = (fileId) => {
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    };

    // Set first video as default on component mount
    useEffect(() => {
        if (tutorialVideos.length > 0 && !selectedVideoId) {
            setSelectedVideoId(tutorialVideos[0].fileId);
            setSelectedVideoTitle(tutorialVideos[0].title);
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
            <div className="w-72 bg-gray-800 text-white p-4 border-r border-gray-700 overflow-y-auto">
                <h2 className="text-xl font-bold mb-6">AI Tutorial Videos</h2>
                <ul className="space-y-3">
                    {tutorialVideos.map((video) => (
                        <li key={video.id}>
                            <button
                                onClick={() => {
                                    setSelectedVideoId(video.fileId);
                                    setSelectedVideoTitle(video.title);
                                }}
                                className={`flex flex-col w-full p-3 rounded text-left hover:bg-gray-700 transition-colors ${
                                    selectedVideoId === video.fileId ? "bg-gray-700 ring-2 ring-blue-500" : ""
                                }`}
                            >
                                <span className="font-medium">{video.title}</span>
                                <div className="flex justify-between mt-1">
                                    <span className="text-xs text-gray-300">{video.duration}</span>
                                    <span className="text-xs text-gray-400">{video.id}/6</span>
                                </div>
                                <p className="text-xs text-gray-300 mt-2">{video.description}</p>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 flex flex-col">
                <h1 className="text-3xl font-bold mb-6 text-center">AI & Machine Learning Tutorials</h1>
                
                {selectedVideoId && (
                    <>
                        <div className="flex-1 flex flex-col items-center">
                            <div className="w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl">
                                <div className="relative pt-[56.25%]"> {/* 16:9 aspect ratio */}
                                    <video
                                        key={selectedVideoId}
                                        src={getVideoUrl(selectedVideoId)}
                                        controls
                                        controlsList="nodownload"
                                        className="absolute top-0 left-0 w-full h-full"
                                        disablePictureInPicture
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </div>
                            
                            <div className="w-full max-w-4xl mt-4">
                                <h2 className="text-xl font-semibold">{selectedVideoTitle}</h2>
                                <p className="text-gray-600">
                                    {tutorialVideos.find(v => v.fileId === selectedVideoId)?.description}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 w-full max-w-4xl mx-auto">
                            <FeedbackForm
                                fileId={selectedVideoId}
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
    // Implement your feedback submission logic here
    console.log("Submitting feedback:", feedback);
    // Example: axios.post('/api/feedback/tutorials', feedback)
};

export default Tutorials;