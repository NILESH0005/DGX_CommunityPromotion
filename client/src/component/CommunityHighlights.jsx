import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const modules = [
  {
    title: "Learning Management System",
    description:
      "Access structured learning paths, track progress, and master new skills with our comprehensive LMS.",
    category: "LMS",
    image:
      "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    icon: "📚",
    stats: "500+ Courses",
    color: "from-blue-500 to-cyan-400"
  },
  {
    title: "Discussions Forum",
    description:
      "Engage in meaningful conversations, share knowledge, and collaborate with our vibrant community.",
    category: "Community",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    icon: "💬",
    stats: "10k+ Members",
    color: "from-purple-500 to-pink-400"
  },
  {
    title: "Insightful Blogs",
    description:
      "Read expert articles, stay updated with latest trends, and expand your knowledge horizon.",
    category: "Content",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    icon: "📝",
    stats: "200+ Articles",
    color: "from-green-500 to-emerald-400"
  },
  {
    title: "Events & Workshops",
    description:
      "Join exciting events, meet industry experts, and expand your professional network.",
    category: "Networking",
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1412&q=80",
    icon: "🎪",
    stats: "50+ Events",
    color: "from-orange-500 to-red-400"
  },
  {
    title: "Interactive Quizzes",
    description:
      "Test your knowledge with engaging quizzes and track your learning progress.",
    category: "Assessment",
    image:
      "https://images.pexels.com/photos/5428830/pexels-photo-5428830.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    icon: "🧠",
    stats: "100+ Quizzes",
    color: "from-indigo-500 to-blue-400"
  },
  {
    title: "Smart Recommendations",
    description:
      "Get personalized content suggestions based on your interests and learning patterns.",
    category: "AI-Powered",
    image:
      "https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1476&q=80",
    icon: "✨",
    stats: "AI-Driven",
    color: "from-violet-500 to-purple-400"
  },
  {
    title: "Leaderboard Rankings",
    description:
      "Compete with peers, earn points, and climb the ranks based on your achievements.",
    category: "Gamification",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    icon: "🏆",
    stats: "Global Rankings",
    color: "from-yellow-500 to-orange-400"
  },
  {
    title: "Project Showcase",
    description:
      "Display your creations, get feedback, and inspire others with your innovative projects.",
    category: "Portfolio",
    image:
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1670&q=80",
    icon: "🚀",
    stats: "1000+ Projects",
    color: "from-teal-500 to-cyan-400"
  },
];

const CommunityHighlights = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Check screen size and update isMobile state
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto switch highlight every 3 seconds for mobile view
  useEffect(() => {
    if (!isMobile || isPaused) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % modules.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isMobile, isPaused]);

  const nextCard = () => {
    setActiveIndex((prev) => (prev + 1) % modules.length);
  };

  const prevCard = () => {
    setActiveIndex((prev) => (prev - 1 + modules.length) % modules.length);
  };

  // Desktop view - grid layout
  if (!isMobile) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#0a0f2e] via-[#1a1f3a] to-[#0f1629] text-white flex flex-col items-center py-16 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        {/* Heading */}
        <div className="w-full max-w-7xl mb-16 text-center relative z-10">
          <h1 className="text-6xl sm:text-7xl py-4 md:text-8xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 text-transparent bg-clip-text drop-shadow-2xl mb-6">
            Community Highlights
          </h1>
          <div className="relative">
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Discover the powerful features that make our platform exceptional
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-8xl relative z-10">
          {modules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10`} />
                <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-20 z-5`} />
                
                <img
                  src={module.image}
                  alt={module.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                <div className="absolute top-4 left-4 z-20 flex items-center space-x-3">
                  <span className="text-2xl drop-shadow-lg">{module.icon}</span>
                  <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30 shadow-lg">
                    {module.category}
                  </span>
                </div>

                <div className="absolute top-4 right-4 z-20">
                  <span className={`bg-gradient-to-r ${module.color} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg`}>
                    {module.stats}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="text-lg font-bold text-white">
                  {module.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {module.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center z-10">
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 text-white font-bold text-lg">
            Join Our Community Today!
          </button>
        </div>
      </div>
    );
  }

  // Mobile view - carousel layout
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0a0f2e] via-[#1a1f3a] to-[#0f1629] text-white flex flex-col items-center p-3 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Heading */}
      <div className="w-full mb-10 text-center relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 text-transparent bg-clip-text drop-shadow-xl mb-4">
          Community Highlights
        </h1>
        <p className="text-lg text-gray-300 max-w-md mx-auto">
          Discover the powerful features that make our platform exceptional
        </p>
      </div>

      {/* Carousel Container */}
      <div 
        className="relative w-full max-w-md h-96 flex items-center justify-center mb-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Navigation Buttons */}
        <button 
          onClick={prevCard}
          className="absolute left-2 z-20 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-2 transition-all duration-300"
          aria-label="Previous card"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={nextCard}
          className="absolute right-2 z-20 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-2 transition-all duration-300"
          aria-label="Next card"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Animated Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute w-full h-full"
          >
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl h-full">
              <div className="relative h-48 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10`} />
                <div className={`absolute inset-0 bg-gradient-to-br ${modules[activeIndex].color} opacity-20 z-5`} />
                
                <img
                  src={modules[activeIndex].image}
                  alt={modules[activeIndex].title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                <div className="absolute top-4 left-4 z-20 flex items-center space-x-3">
                  <span className="text-2xl drop-shadow-lg">{modules[activeIndex].icon}</span>
                  <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30 shadow-lg">
                    {modules[activeIndex].category}
                  </span>
                </div>

                <div className="absolute top-4 right-4 z-20">
                  <span className={`bg-gradient-to-r ${modules[activeIndex].color} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg`}>
                    {modules[activeIndex].stats}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="text-lg font-bold text-white">
                  {modules[activeIndex].title}
                </h3>
                <p className="text-gray-300 text-sm">
                  {modules[activeIndex].description}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicators */}
      <div className="flex gap-2 mb-8 z-10">
        {modules.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeIndex === index 
                ? "bg-white scale-125" 
                : "bg-gray-500"
            }`}
            aria-label={`Go to card ${index + 1}`}
          />
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center z-10">
        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 text-white font-bold">
          Join Our Community Today!
        </button>
      </div>
    </div>
  );
};

export default CommunityHighlights;