import React, { useState } from "react";
import Swal from "sweetalert2";
import { QRCodeSVG } from "qrcode.react";

const ContentSection = () => {
  // Dummy data for demonstration
  const dummyData = [
    {
      id: 1,
      Title: "Transform Your Learning Experience",
      Content: `Discover a new way to learn with our cutting-edge platform that combines AI-powered recommendations with interactive content.

• Personalized learning paths tailored to your goals
• Real-time progress tracking and analytics
• Collaborative features to learn with peers
• Access to exclusive resources and expert mentors

Join thousands of students who have already transformed their educational journey with us.`,
      Image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
      formLink: "https://forms.example.com/learning-experience"
    },
    {
      id: 2,
      Title: "Master Skills with Project-Based Learning",
      Content: `Our project-based approach ensures you don't just learn theory but apply knowledge in real-world scenarios.

• Build portfolio projects as you learn
• Receive feedback from industry professionals
• Participate in hackathons and coding challenges
• Showcase your skills to potential employers

Start building your future today with hands-on experience that matters.`,
      Image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1336&q=80",
      formLink: "https://forms.example.com/project-learning"
    }
  ];

  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const content = dummyData[currentContentIndex];

  const handleNext = () => {
    setCurrentContentIndex((prev) => (prev + 1) % dummyData.length);
  };

  const handlePrevious = () => {
    setCurrentContentIndex((prev) => (prev - 1 + dummyData.length) % dummyData.length);
  };

  const handleDownloadQR = () => {
    Swal.fire({
      title: 'QR Code Downloaded!',
      text: 'Scan this code to access our exclusive form.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3b82f6',
    });
  };

  const handleFormLinkClick = () => {
    Swal.fire({
      title: 'Redirecting to Form',
      text: 'You are being redirected to our registration form.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Continue',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3b82f6',
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(content.formLink, '_blank');
      }
    });
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#0a0f1c] to-[#1a1f2c] py-16 px-4 md:px-16">
      <div className="max-w-7xl mx-auto rounded-2xl border border-blue-800/50 shadow-[0_0_30px_#1e40af55] bg-gradient-to-br from-[#0f172acc] to-[#1e293bcc] backdrop-blur-md transition-all duration-500 hover:shadow-[0_0_40px_#3b82f655] overflow-hidden">
        
        {/* Content Navigation */}
        <div className="flex justify-between items-center p-4 bg-blue-900/20 border-b border-blue-700/30">
          <div className="flex space-x-2">
            {dummyData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentContentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === currentContentIndex ? 'bg-blue-400 scale-110' : 'bg-blue-800'}`}
                aria-label={`Go to content ${index + 1}`}
              />
            ))}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-full bg-blue-800/50 hover:bg-blue-700 transition-all"
              aria-label="Previous content"
            >
              <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-blue-800/50 hover:bg-blue-700 transition-all"
              aria-label="Next content"
            >
              <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 p-8 group">
          {/* Text Content */}
          <div className="md:w-2/3 flex flex-col justify-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent transition-all duration-500 group-hover:from-blue-400 group-hover:to-purple-400">
              {content.Title}
            </h2>
            
            <div className="text-gray-300 whitespace-pre-wrap break-words max-w-none leading-relaxed space-y-4">
              {content.Content.split("\n").map((para, i) => {
                if (para.trim() === '') return null;
                
                if (para.startsWith('•')) {
                  return (
                    <div key={i} className="flex items-start">
                      <span className="text-blue-400 mr-2 mt-1">•</span>
                      <p className="hover:text-white transition duration-300">{para.substring(1).trim()}</p>
                    </div>
                  );
                }
                
                return (
                  <p key={i} className="hover:text-white transition duration-300">
                    {para}
                  </p>
                );
              })}
            </div>
            
            <div className="flex flex-wrap gap-4 mt-6">
              <button 
                onClick={handleFormLinkClick}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Register Now
              </button>
            </div>
          </div>

          {/* Image and QR Code Section */}
          <div className="md:w-1/3 flex flex-col items-center justify-center space-y-6">
            {content.Image ? (
              <div className="relative w-full group/image-container">
                <img
                  src={content.Image}
                  alt="Content Visual"
                  className="w-full h-56 object-cover rounded-xl border-2 border-blue-600/50 shadow-lg transition duration-500 group-hover/image-container:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent rounded-xl flex items-end justify-center p-4 opacity-0 group-hover/image-container:opacity-100 transition-opacity duration-500">
                  <button 
                    onClick={handleFormLinkClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-56 w-full flex items-center justify-center border-2 border-dashed border-blue-600/50 bg-white/5 text-blue-200 rounded-xl">
                No image available
              </div>
            )}
            
            {/* Permanent QR Code Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl shadow-2xl border border-blue-200/50 w-full transform transition-all duration-500 hover:scale-105 hover:shadow-[0_10px_30px_rgba(59,130,246,0.3)]">
              <div className="text-center mb-3">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Scan to Register</h3>
                <p className="text-xs text-gray-600">to our Faculty Development Program(FDP)</p>
              </div>
              
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-white rounded-lg shadow-inner border border-gray-200">
                  <QRCodeSVG 
                    value={content.formLink}
                    size={140}
                    level="H"
                    includeMargin
                    className="mx-auto"
                    imageSettings={{
                      src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkuNjY2NjcgMTUuMTY2N0M5LjY2NjY3IDE0LjI1IDEwLjQxNjcgMTMuNSAxMS4zMzMzIDEzLjVIMTIuNjY2N0MxMy41ODMzIDEzLjUgMTQuMzMzMyAxNC4yNSAxNC4zMzMzIDE1LjE2NjdWMTguODMzM0MxNC4zMzMzIDE5Ljc1IDEzLjU4MzMgMjAuNSAxMi42NjY3IDIwLjVIMTEuMzMzM0MxMC40MTY3IDIwLjUgOS42NjY2NyAxOS43NSA5LjY2NjY3IDE4LjgzMzNWMTUuMTY2N1oiIGZpbGw9IiMzQjgyRjYiLz4KPHBhdGggZD0iTTkuNjY2NjcgNS4xNjY2N0M5LjY2NjY3IDQuMjUgMTAuNDE2NyAzLjUgMTEuMzMzMyAzLjVIMTIuNjY2N0MxMy41ODMzIDMuNSAxNC4zMzMzIDQuMjUgMTQuMzMzMyA1LjE2NjY3VjguODMzMzNDMTQuMzMzMyA5Ljc1IDEzLjU4MzMgMTAuNSAxMi42NjY3IDEwLjVIMTEuMzMzM0MxMC40MTY3IDEwLjUgOS42NjY2NyA5Ljc1IDkuNjY2NjcgOC44MzMzM1Y1LjE2NjY3WiIgZmlsbD0iIzNCNzBGOCIvPgo8cGF0aCBkPSJNMy41IDExLjMzMzNDMy41IDEwLjQxNjcgNC4yNSA5LjY2NjY3IDUuMTY2NjcgOS42NjY2N0g4LjgzMzMzQzkuNzUgOS42NjY2NyAxMC41IDEwLjQxNjcgMTAuNSA5LjY2NjY3VjExLjMzMzNDMTAuNSAxMi4yNSA5Ljc1IDEzIDguODMzMzMgMTNINS4xNjY2N0M0LjI1IDEzIDMuNSAxMi4yNSAzLjUgMTEuMzMzM1oiIGZpbGw9IiM4QjQ0RDEiLz4KPHBhdGggZD0iTTEzLjUgMTEuMzMzM0MxMy41IDEwLjQxNjcgMTQuMjUgOS42NjY2NyAxNS4xNjY3IDkuNjY2NjdIMTguODMzM0MxOS43NSA5LjY2NjY3IDIwLjUgMTAuNDE2NyAyMC41IDExLjMzMzNDMjAuNSAxMi4yNSAxOS43NSAxMyAxOC44MzMzIDEzSDE1LjE2NjdDMTQuMjUgMTMgMTMuNSAxMi4yNSAxMy41IDExLjMzMzNaIiBmaWxsPSIjOEI0NEQxIi8+Cjwvc3ZnPgo=",
                      height: 24,
                      width: 24,
                      excavate: true,
                    }}
                  />
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={handleFormLinkClick}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open Form
                </button>
                
                <button 
                  onClick={handleDownloadQR}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium py-1 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentSection;