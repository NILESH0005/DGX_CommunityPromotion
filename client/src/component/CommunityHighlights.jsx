import React, { useEffect, useState } from "react";

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
  const [isPaused, setIsPaused] = useState(false);

  // Auto switch highlight every 3 seconds for better viewing
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % modules.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0a0f2e] via-[#1a1f3a] to-[#0f1629] text-white flex flex-col items-center py-16 px-6 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
        
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-bounce"
            style={{
              width: Math.random() * 8 + 2 + "px",
              height: Math.random() * 8 + 2 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              backgroundColor: `rgba(${Math.random() * 100 + 155}, ${
                Math.random() * 100 + 155
              }, 255, ${Math.random() * 0.4 + 0.1})`,
              animationDelay: Math.random() * 5 + "s",
              animationDuration: (Math.random() * 3 + 2) + "s",
            }}
          />
        ))}
      </div>

      {/* Enhanced Heading */}
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

      {/* Enhanced Cards Grid */}
      <div
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 relative z-10 max-w-7xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {modules.map((module, index) => (
          <div
            key={module.title}
            className={`relative rounded-3xl overflow-hidden group transition-all duration-700 transform ${
              index === activeIndex
                ? "scale-110 shadow-[0_0_50px_rgba(96,165,250,0.6)] z-20 rotate-1"
                : "scale-95 opacity-80 hover:opacity-100"
            } hover:scale-105 hover:rotate-0`}
          >
            {/* Enhanced Image Section */}
            <div className="relative overflow-hidden h-64">
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10`} />
              <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-20 z-5`} />
              
              <img
                src={module.image}
                alt={module.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
              
              {/* Enhanced Badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center space-x-3">
                <span className="text-3xl drop-shadow-lg">{module.icon}</span>
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full border border-white/30 shadow-lg">
                  {module.category}
                </span>
              </div>

              {/* Stats Badge */}
              <div className="absolute top-4 right-4 z-20">
                <span className={`bg-gradient-to-r ${module.color} text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg`}>
                  {module.stats}
                </span>
              </div>

              {/* Floating icon on hover */}
              <div className="absolute bottom-4 right-4 z-20 transform transition-all duration-500 group-hover:scale-125 group-hover:rotate-12">
                <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                  {module.icon}
                </div>
              </div>
            </div>

            {/* Enhanced Content */}
            <div className="p-6 space-y-4 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">
                {module.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                {module.description}
              </p>
              
              {/* Feature highlight */}
              <div className="pt-3 border-t border-gray-600/30">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold bg-gradient-to-r ${module.color} text-transparent bg-clip-text`}>
                    Premium Feature
                  </span>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-1 h-1 rounded-full bg-gradient-to-r ${module.color}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle border glow effect */}
            <div className={`absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r ${module.color} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} style={{mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'subtract'}} />
          </div>
        ))}
      </div>

      {/* Enhanced Indicators */}
      <div className="flex gap-3 mt-12 z-10">
        {modules.map((module, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`relative overflow-hidden transition-all duration-500 ${
              activeIndex === index 
                ? "w-12 h-4 bg-gradient-to-r from-blue-500 to-purple-500 scale-125" 
                : "w-4 h-4 bg-gray-500/50 hover:bg-gray-400"
            } rounded-full`}
          >
            {activeIndex === index && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center z-10">
        <div className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300">
          <span className="text-white font-bold text-lg">Join Our Community Today!</span>
        </div>
      </div>
    </div>
  );
};

export default CommunityHighlights;