import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const modules = [
  {
    title: "Learning Management System",
    description: "Access structured learning paths, track progress, and master new skills with our comprehensive LMS.",
    category: "LMS",
    image: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    path: "/LearningPath",
    icon: "📚"
  },
  {
    title: "Discussions Forum",
    description: "Engage in meaningful conversations, share knowledge, and collaborate with our vibrant community.",
    category: "Community",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    path: "/Discussion",
    icon: "💬"
  },
  {
    title: "Insightful Blogs",
    description: "Read expert articles, stay updated with latest trends, and expand your knowledge horizon.",
    category: "Content",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    path: "/Blog",
    icon: "📝"
  },
  {
    title: "Events & Workshops",
    description: "Join exciting events, meet industry experts, and expand your professional network.",
    category: "Networking",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1412&q=80",
    path: "/EventWorkshopPage",
    icon: "🎪"
  },
  {
    title: "Interactive Quizzes",
    description: "Test your knowledge with engaging quizzes and track your learning progress.",
    category: "Assessment",
    image: "https://images.pexels.com/photos-5428830/pexels-photo-5428830.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    path: "/QuizInterface",
    icon: "🧠"
  },
  {
    title: "Smart Recommendations",
    description: "Get personalized content suggestions based on your interests and learning patterns.",
    category: "AI-Powered",
    image: "https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1476&q=80",
    path: "/recommendations",
    icon: "✨"
  },
  {
    title: "Leaderboard Rankings",
    description: "Compete with peers, earn points, and climb the ranks based on your achievements.",
    category: "Gamification",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    path: "/leaderboard",
    icon: "🏆"
  },
  {
    title: "Project Showcase",
    description: "Display your creations, get feedback, and inspire others with your innovative projects.",
    category: "Portfolio",
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1670&q=80",
    path: "/projects",
    icon: "🚀"
  }
];

const CommunityHighlights = () => {
  const containerRef = useRef(null);
  const marqueeRef = useRef(null);
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!marqueeRef.current || !containerRef.current) return;

    const marqueeWidth = marqueeRef.current.scrollWidth;
    const containerWidth = containerRef.current.offsetWidth;
    
    // Calculate animation duration based on content width
    const duration = marqueeWidth / 50; // Adjust speed as needed

    // Apply animation to marquee
    marqueeRef.current.style.animation = `scroll ${duration}s linear infinite`;
    
    // Pause animation when hovered
    const marqueeElement = marqueeRef.current;
    const handleMouseEnter = () => {
      marqueeElement.style.animationPlayState = 'paused';
      setIsPaused(true);
    };
    
    const handleMouseLeave = () => {
      marqueeElement.style.animationPlayState = 'running';
      setIsPaused(false);
    };
    
    marqueeElement.addEventListener('mouseenter', handleMouseEnter);
    marqueeElement.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      marqueeElement.removeEventListener('mouseenter', handleMouseEnter);
      marqueeElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#060a1f] to-[#0a1128] text-white flex flex-col items-center py-16 px-6 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: Math.random() * 20 + 5 + 'px',
              height: Math.random() * 20 + 5 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              backgroundColor: `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, ${Math.random() * 0.3 + 0.1})`,
              animationDelay: Math.random() * 5 + 's',
            }}
          />
        ))}
      </div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="w-full max-w-6xl mb-12 text-center relative z-10"
      >
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-transparent bg-clip-text drop-shadow-2xl">
          Community Highlights
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          Discover the powerful features that make our platform exceptional
        </p>
      </motion.div>

      {/* Marquee Container */}
      <div 
        ref={containerRef}
        className="w-full max-w-7xl overflow-hidden relative"
      >
        <style>
          {`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}
        </style>
        
        <div 
          ref={marqueeRef}
          className="flex w-max"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Double the modules for seamless looping */}
          {[...modules, ...modules].map((module, index) => (
            <motion.div
              key={`${module.title}-${index}`}
              className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#1e293b] border border-blue-800/50 shadow-[0_0_25px_#3b82f6aa] cursor-pointer group mx-4 flex-shrink-0"
              style={{ width: "350px" }}
              whileHover={{
                scale: 1.03,
                y: -5,
                boxShadow: "0 0 40px #60a5faaa"
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => handleCardClick(module.path)}
            >
              {/* Image & Category */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                <img
                  src={module.image}
                  alt={module.title}
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                
                {/* Category badge */}
                <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
                  <span className="text-2xl">{module.icon}</span>
                  <span className="bg-blue-700/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                    {module.category}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                  {module.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {module.description}
                </p>

                <div className="mt-4 inline-flex items-center text-blue-400 group-hover:text-cyan-300 font-semibold transition-colors">
                  Explore feature
                  <span className="ml-2 transform transition-transform duration-300 group-hover:translate-x-2">
                    →
                  </span>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>Hover over the cards to pause the animation</p>
      </div>
    </div>
  );
};

export default CommunityHighlights;