import React, { useState, useEffect } from "react";

const ParallaxSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // DGX Community promotional data
  const promotionalData = [
    {
      id: 1,
      title: "Welcome to DGX Community",
      description: "Join India's fastest growing tech community where innovation meets collaboration",
      cta: "Join Now",
      color: "from-purple-600 to-blue-500",
      icon: "🚀",
    },
    {
      id: 2,
      title: "Faculty Development Programs",
      description: "Empower educators with cutting-edge technology training and certification",
      cta: "Register for FDP",
      color: "from-green-500 to-teal-600",
      icon: "🎓",
    },
    {
      id: 3,
      title: "Build. Learn. Connect.",
      description: "Access exclusive workshops, hackathons, and networking opportunities",
      cta: "Explore Events",
      color: "from-orange-500 to-red-500",
      icon: "💡",
    },
  ];

  useEffect(() => {
    // Auto-rotate promotional text
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % promotionalData.length);
    }, 4000);

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
    if (windowSize.width < 640) return "text-3xl";
    if (windowSize.width < 768) return "text-4xl";
    if (windowSize.width < 1024) return "text-5xl";
    return "text-6xl";
  };

  const getDescriptionSize = () => {
    if (windowSize.width < 640) return "text-base";
    if (windowSize.width < 768) return "text-lg";
    return "text-xl";
  };

  // Create floating particles
  const renderParticles = () => {
    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push(
        <div
          key={i}
          className="absolute rounded-full opacity-70"
          style={{
            width: Math.random() * 8 + 3 + 'px',
            height: Math.random() * 8 + 3 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            backgroundColor: `rgba(${Math.random() * 100 + 100}, ${Math.random() * 150 + 100}, 255, ${Math.random() * 0.6 + 0.4})`,
            animation: `float ${Math.random() * 8 + 12}s infinite ease-in-out`,
            animationDelay: Math.random() * 5 + 's',
          }}
        />
      );
    }
    return particles;
  };

  const handleCTAClick = () => {
    // Add your registration/navigation logic here
    if (activeIndex === 1) {
      // Navigate to FDP registration
      console.log("Navigating to FDP Registration");
    } else {
      console.log(`Navigating to: ${promotionalData[activeIndex].cta}`);
    }
  };

  return (
    <section className="relative w-full h-screen flex justify-center items-center overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      {/* Background elements */}
      <div id="particles" className="absolute inset-0 pointer-events-none">
        {renderParticles()}
      </div>
      
      <img
        src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
        id="circuit_board"
        alt="Circuit Board"
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none opacity-15"
        loading="lazy"
      />
      
      <img
        src="https://images.unsplash.com/photo-1550684376-efcbd6e3f031?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
        id="tech_wave"
        alt="Tech Wave"
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none opacity-25"
        loading="lazy"
      />

      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-blue-600/20 animate-pulse"></div>

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-7xl mx-auto">
        {/* DGX Community Logo/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-28 h-28 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-500 hover:rotate-12">
            <span className="text-4xl font-bold text-white">DGX</span>
          </div>
        </div>

        {/* Dynamic Icon Display */}
        <div className="mb-6">
          <span className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>
            {promotionalData[activeIndex].icon}
          </span>
        </div>

        <h1
          id="text"
          className={`text-white ${getTextSize()} font-bold mb-6 leading-tight transition-all duration-1000`}
          style={{
            textShadow: "2px 2px 20px rgba(147, 51, 234, 0.8)",
            background: 'linear-gradient(45deg, #fff, #e0e7ff, #c7d2fe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {promotionalData[activeIndex].title}
        </h1>
        
        <p className={`text-gray-300 ${getDescriptionSize()} mb-8 max-w-3xl mx-auto transition-all duration-1000 leading-relaxed`}>
          {promotionalData[activeIndex].description}
        </p>

        {/* Stats Section */}
        <div className="flex justify-center mb-10 space-x-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">10K+</div>
            <div className="text-sm text-gray-400">Active Members</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">500+</div>
            <div className="text-sm text-gray-400">Events Hosted</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">50+</div>
            <div className="text-sm text-gray-400">Industry Partners</div>
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="mb-10 transition-all duration-1000">
          <button 
            onClick={handleCTAClick}
            className={`bg-gradient-to-r ${promotionalData[activeIndex].color} text-white font-bold py-4 px-10 rounded-full shadow-2xl hover:shadow-purple-500/25 transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 text-lg border-2 border-transparent hover:border-white/30`}
          >
            {promotionalData[activeIndex].cta}
            <span className="ml-2">→</span>
          </button>
        </div>

        {/* QR Code Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-sm mx-auto mb-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <p className="text-white text-sm font-semibold mb-4 tracking-wide">
            📱 FDP REGISTRATION
          </p>
          <div className="w-32 h-32 bg-white rounded-lg mx-auto p-2 mb-3">
            {/* QR Code placeholder - replace with actual QR code */}
            <div className="w-full h-full bg-black rounded flex items-center justify-center">
              <div className="grid grid-cols-8 gap-0.5 w-24 h-24">
                {Array.from({ length: 64 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="text-gray-300 text-xs">
            Scan to register for Faculty Development Programs
          </p>
        </div>
        
        {/* Indicators */}
        <div className="flex justify-center space-x-3">
          {promotionalData.map((_, index) => (
            <button
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-300 transform hover:scale-125 ${
                index === activeIndex 
                  ? 'bg-white shadow-lg shadow-white/50' 
                  : 'bg-gray-500 hover:bg-gray-300'
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show promotion ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Floating Action Elements */}
      {/* <div className="absolute top-20 right-10 z-30 hidden lg:block">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
          🔥 Join 10K+ Developers
        </div>
      </div> */}

      <div className="absolute bottom-20 left-10 z-30 hidden lg:block">
          {/* <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold animate-bounce">
            🎯 Free Workshops Available
          </div> */}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="animate-bounce">
          <svg className="w-6 h-6 text-white opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>

      {/* Enhanced CSS animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
            33% { transform: translateY(-15px) rotate(5deg); opacity: 1; }
            66% { transform: translateY(-25px) rotate(-3deg); opacity: 0.8; }
          }
          
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.5); }
            50% { box-shadow: 0 0 40px rgba(147, 51, 234, 0.8), 0 0 60px rgba(59, 130, 246, 0.6); }
          }
        `}
      </style>
    </section>
  );
};

export default ParallaxSection;