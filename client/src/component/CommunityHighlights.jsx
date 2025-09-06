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
    color: "from-DGXblue to-DGXgreen",
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
    color: "from-DGXblue to-DGXgreen",
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
    color: "from-DGXblue to-DGXgreen",
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
    color: "from-DGXblue to-DGXgreen",
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
    color: "from-DGXblue to-DGXgreen",
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
    color: "from-DGXblue to-DGXgreen",
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
    color: "from-DGXblue to-DGXgreen",
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
    color: "from-DGXblue to-DGXgreen",
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
    window.addEventListener("resize", checkScreenSize);

    // Clean up
    return () => window.removeEventListener("resize", checkScreenSize);
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
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-green-50 text-DGXblue flex flex-col items-center py-16 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-0 w-72 h-72 bg-green-200 rounded-full opacity-30 mix-blend-multiply filter blur-3xl"
            animate={{ y: [0, 50, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-64 h-64 bg-blue-200 rounded-full opacity-25 mix-blend-multiply filter blur-3xl"
            animate={{ y: [0, -40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Heading */}
        <div className="w-full max-w-7xl mb-16 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-DGXblue mb-6">
            Community Highlights
          </h1>
          <div className="relative">
            <p className="text-xl md:text-2xl text-DGXgreen max-w-3xl mx-auto leading-relaxed">
              Discover the powerful features that make our platform exceptional
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-DGXblue to-DGXgreen rounded-full" />
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
              className="bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center text-center relative border border-green-200 hover:shadow-green-300/50 transition-all duration-300 h-full"
            >
              <div className="relative h-48 w-full overflow-hidden rounded-xl mb-5">
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-DGXblue/80 via-DGXblue/20 to-transparent z-10`}
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-20 z-5`}
                />

                <img
                  src={module.image}
                  alt={module.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                <div className="absolute top-4 left-4 z-20 flex items-center space-x-3">
                  <span className="text-2xl drop-shadow-lg">{module.icon}</span>
                  <span className="bg-white/80 backdrop-blur-sm text-DGXblue text-xs font-bold px-3 py-1 rounded-full border border-DGXblue/30 shadow-lg">
                    {module.category}
                  </span>
                </div>

                <div className="absolute top-4 right-4 z-20">
                  <span
                    className={`bg-gradient-to-r ${module.color} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg`}
                  >
                    {module.stats}
                  </span>
                </div>
              </div>

              <div className="space-y-3 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-DGXblue">
                  {module.title}
                </h3>
                <p className="text-DGXgreen text-sm leading-relaxed flex-1">
                  {module.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Mobile view - carousel layout
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-green-50 text-DGXblue flex flex-col items-center p-3 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-64 h-64 bg-green-200 rounded-full opacity-30 mix-blend-multiply filter blur-3xl"
          animate={{ y: [0, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-56 h-56 bg-blue-200 rounded-full opacity-25 mix-blend-multiply filter blur-3xl"
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Heading */}
      <div className="w-full mb-10 text-center relative z-10">
        <h1 className="text-4xl font-extrabold text-DGXblue mb-4">
          Community Highlights
        </h1>
        <p className="text-lg text-DGXgreen max-w-md mx-auto">
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
          className="absolute left-2 z-20 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-2 transition-all duration-300 shadow-md border border-DGXblue/20"
          aria-label="Previous card"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-DGXblue"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={nextCard}
          className="absolute right-2 z-20 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-2 transition-all duration-300 shadow-md border border-DGXblue/20"
          aria-label="Next card"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-DGXblue"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
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
            <div className="bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center text-center relative border border-green-200 h-full">
              <div className="relative h-48 w-full overflow-hidden rounded-xl mb-5">
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-DGXblue/80 via-DGXblue/20 to-transparent z-10`}
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${modules[activeIndex].color} opacity-20 z-5`}
                />

                <img
                  src={modules[activeIndex].image}
                  alt={modules[activeIndex].title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                <div className="absolute top-4 left-4 z-20 flex items-center space-x-3">
                  <span className="text-2xl drop-shadow-lg">
                    {modules[activeIndex].icon}
                  </span>
                  <span className="bg-white/80 backdrop-blur-sm text-DGXblue text-xs font-bold px-3 py-1 rounded-full border border-DGXblue/30 shadow-lg">
                    {modules[activeIndex].category}
                  </span>
                </div>

                <div className="absolute top-4 right-4 z-20">
                  <span
                    className={`bg-gradient-to-r ${modules[activeIndex].color} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg`}
                  >
                    {modules[activeIndex].stats}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-DGXblue">
                  {modules[activeIndex].title}
                </h3>
                <p className="text-DGXgreen text-sm">
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
              activeIndex === index ? "bg-DGXblue scale-125" : "bg-DGXgreen/30"
            }`}
            aria-label={`Go to card ${index + 1}`}
          />
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center z-10">
        <button className="px-6 py-3 bg-gradient-to-r from-DGXblue to-DGXgreen rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 text-white font-bold">
          Join Our Community Today!
        </button>
      </div>
    </div>
  );
};

export default CommunityHighlights;
