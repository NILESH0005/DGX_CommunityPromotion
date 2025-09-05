import React, { useState, useEffect } from "react";

const ParallaxSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Dummy promotional data
  const promotionalData = [
    {
      id: 1,
      title: "AI-Powered Learning Platform",
      description: "Experience the future of education with our cutting-edge AI technology",
      cta: "Start Learning Now",
      color: "from-purple-600 to-blue-500",
    },
    {
      id: 2,
      title: "Join Our Tech Community",
      description: "Connect with like-minded developers and innovators worldwide",
      cta: "Join Community",
      color: "from-green-500 to-teal-600",
    },
    {
      id: 3,
      title: "Master In-Demand Skills",
      description: "Learn the most sought-after technologies in today's job market",
      cta: "Explore Courses",
      color: "from-orange-500 to-red-500",
    },
  ];

  useEffect(() => {
    // Auto-rotate promotional text
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % promotionalData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [promotionalData.length]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const text = document.getElementById("text");
      const circuit = document.getElementById("circuit_board");
      const wave = document.getElementById("tech_wave");
      const particles = document.getElementById("particles");

      const parallaxFactorText = windowSize.width > 768 ? 1.5 : 0.8;
      const parallaxFactorCircuit = windowSize.width > 768 ? 0.5 : 0.3;
      const parallaxFactorWave = windowSize.width > 768 ? 0.3 : 0.2;
      const parallaxFactorParticles = windowSize.width > 768 ? 0.7 : 0.4;

      if (text) text.style.transform = `translateY(${scrollY * parallaxFactorText}px)`;
      if (circuit) circuit.style.transform = `translateY(${scrollY * parallaxFactorCircuit}px)`;
      if (wave) wave.style.transform = `translateY(${scrollY * parallaxFactorWave}px)`;
      if (particles) particles.style.transform = `translateY(${scrollY * parallaxFactorParticles}px)`;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [windowSize]);

  const getTextSize = () => {
    if (windowSize.width < 640) return "text-4xl";
    if (windowSize.width < 768) return "text-5xl";
    if (windowSize.width < 1024) return "text-6xl";
    return "text-7xl";
  };

  const getDescriptionSize = () => {
    if (windowSize.width < 640) return "text-lg";
    if (windowSize.width < 768) return "text-xl";
    return "text-2xl";
  };

  // Create floating particles
  const renderParticles = () => {
    const particles = [];
    for (let i = 0; i < 30; i++) {
      particles.push(
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 10 + 2 + 'px',
            height: Math.random() * 10 + 2 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            backgroundColor: `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, ${Math.random() * 0.5 + 0.3})`,
            animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
            animationDelay: Math.random() * 5 + 's',
          }}
        />
      );
    }
    return particles;
  };

  return (
    <section className="relative w-full h-screen flex justify-center items-center overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      {/* Background elements */}
      <div id="particles" className="absolute inset-0 pointer-events-none">
        {renderParticles()}
      </div>
      
      <img
        src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
        id="circuit_board"
        alt="Circuit Board"
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none opacity-20"
        loading="lazy"
      />
      
      <img
        src="https://images.unsplash.com/photo-1550684376-efcbd6e3f031?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
        id="tech_wave"
        alt="Tech Wave"
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none opacity-30"
        loading="lazy"
      />

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-6xl mx-auto">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        <h2
          id="text"
          className={`text-white ${getTextSize()} font-bold mb-6 leading-tight transition-all duration-1000`}
          style={{
            textShadow: "2px 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          {promotionalData[activeIndex].title}
        </h2>
        
        <p className={`text-gray-300 ${getDescriptionSize()} mb-10 max-w-2xl mx-auto transition-all duration-1000`}>
          {promotionalData[activeIndex].description}
        </p>
        
        <div className="transition-all duration-1000">
          <button className={`bg-gradient-to-r ${promotionalData[activeIndex].color} text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}>
            {promotionalData[activeIndex].cta}
          </button>
        </div>
        
        {/* Indicators */}
        <div className="flex justify-center mt-10 space-x-2">
          {promotionalData.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === activeIndex ? 'bg-white' : 'bg-gray-500'}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show promotion ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>

      {/* Add CSS for floating animation */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(10deg); }
          }
        `}
      </style>
    </section>
  );
};

export default ParallaxSection;