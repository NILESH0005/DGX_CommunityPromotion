import React, { useState, useEffect } from "react";

const ContentSection = () => {
  // Updated content with FDP information
  const dummyData = [
    {
      id: 1,
      Title: "Faculty Development Program",
      Subtitle: "AI Model Development with NVIDIA Infrastructure",
      Content: `Elevate your teaching and research capabilities with cutting-edge AI technologies. Our comprehensive FDP is designed to empower educators with practical AI skills.

• Master AI model development fundamentals
• Learn deployment strategies using NVIDIA infrastructure
• Build real-world AI applications from scratch
• Integrate AI concepts into your curriculum effectively

Transform your academic approach with industry-leading AI expertise and hands-on experience.`,
      Image:
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      formLink: "https://forms.example.com/fdp-registration",
      highlight: "NVIDIA Certified",
      duration: "5 Days Intensive",
    },
    {
      id: 2,
      Title: "FDP Outcomes",
      Subtitle: "What You'll Achieve",
      Content: `Our Faculty Development Program delivers tangible outcomes that will transform your academic and research capabilities.

• Understand the fundamentals of AI model development and deployment using NVIDIA infrastructure
• Gain practical exposure to building AI applications, such as multi-agent systems, voice assistants, and recommendation models
• Acquire the ability to translate AI concepts into classroom teaching, research projects, and industry-focused applications

Join leading educators who are shaping the future of AI education.`,
      Image:
        "https://images.unsplash.com/photo-1559028012-481c04fa702d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1336&q=80",
      formLink: "https://forms.example.com/fdp-outcomes",
      highlight: "Industry Ready",
      duration: "Lifetime Access",
    },
  ];

  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const content = dummyData[currentContentIndex];

  // Auto-advance content every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentContentIndex((prev) => (prev + 1) % dummyData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, dummyData.length]);

  const handleNext = () => {
    setCurrentContentIndex((prev) => (prev + 1) % dummyData.length);
  };

  const handlePrevious = () => {
    setCurrentContentIndex(
      (prev) => (prev - 1 + dummyData.length) % dummyData.length
    );
  };

  const handleFormLinkClick = () => {
    window.open(content.formLink, "_blank");
  };

  const features = [
    { icon: "🤖", title: "AI Models", desc: "Build & Deploy" },
    { icon: "🎯", title: "Multi-Agent", desc: "Systems" },
    { icon: "🎤", title: "Voice AI", desc: "Assistants" },
    { icon: "📊", title: "ML Models", desc: "Recommendations" },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-[#0a0f1c] via-[#1a1f2c] to-[#2a1f3c] py-16 px-4 md:px-16 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-500/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-2000" />

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-bounce opacity-30"
            style={{
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animationDelay: Math.random() * 3 + "s",
              animationDuration: Math.random() * 2 + 3 + "s",
            }}
          />
        ))}
      </div>

      <div className="max-w-8xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 relative z-10">
          <h1 className="text-5xl md:text-6xl py-2 font-extrabold bg-gradient-to-r from-green-300 via-blue-400 to-purple-400 text-transparent bg-clip-text mb-4">
            Faculty Development Program
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Master AI technologies and transform your academic impact
          </p>
        </div>

        {/* Main Content Card */}
        <div
          className="rounded-3xl border border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.2)] bg-gradient-to-br from-[#0f172a]/90 to-[#1e293b]/90 backdrop-blur-xl transition-all duration-700 hover:shadow-[0_0_80px_rgba(34,197,94,0.3)] hover:border-green-400/50 overflow-hidden group"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Content Navigation */}
          <div className="flex justify-between items-center p-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 border-b border-green-700/30">
            <div className="flex space-x-3">
              {dummyData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentContentIndex(index)}
                  className={`relative overflow-hidden transition-all duration-500 ${
                    index === currentContentIndex
                      ? "w-12 h-4 bg-gradient-to-r from-green-400 to-blue-400"
                      : "w-4 h-4 bg-gray-600/50 hover:bg-green-400/50"
                  } rounded-full group`}
                  aria-label={`Go to content ${index + 1}`}
                >
                  {index === currentContentIndex && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-blue-300 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-">
              <div className="flex space-x-2">
                <button
                  onClick={handlePrevious}
                  className="p-3 rounded-full bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 transition-all duration-300 hover:scale-110"
                  aria-label="Previous content"
                >
                  <svg
                    className="w-5 h-5 text-green-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
                  onClick={handleNext}
                  className="p-3 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 transition-all duration-300 hover:scale-110"
                  aria-label="Next content"
                >
                  <svg
                    className="w-5 h-5 text-blue-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 p-8">
            {/* Text Content */}
            <div className="lg:w-2/3 flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm font-bold rounded-full">
                    {content.highlight}
                  </span>
                  <span className="px-4 py-2 bg-gray-700/50 text-gray-300 text-sm font-medium rounded-full">
                    {content.duration}
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2 transition-all duration-500 group-hover:scale-105">
                  {content.Title}
                </h2>

                <h3 className="text-xl md:text-2xl font-medium bg-gradient-to-r from-green-300 to-blue-300 text-transparent bg-clip-text">
                  {content.Subtitle}
                </h3>
              </div>

              <div className="text-gray-300 whitespace-pre-wrap break-words leading-relaxed space-y-4">
                {content.Content.split("\n").map((para, i) => {
                  if (para.trim() === "") return null;

                  if (para.startsWith("•")) {
                    return (
                      <div
                        key={i}
                        className="flex items-start group/item hover:bg-green-500/5 p-2 rounded-lg transition-all duration-300"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center mr-3 mt-1 group-hover/item:scale-110 transition-transform duration-300">
                          <span className="text-white text-sm font-bold">
                            ✓
                          </span>
                        </div>
                        <p className="group-hover/item:text-white transition duration-300 flex-1">
                          {para.substring(1).trim()}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <p
                      key={i}
                      className="text-lg hover:text-white transition duration-300 leading-relaxed"
                    >
                      {para}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Image and Features Section */}
            <div className="lg:w-1/3 flex flex-col space-y-6">
              {/* Enhanced Image */}
              <div className="relative group/image overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-transparent to-blue-900/40 z-10" />
                <img
                  src={content.Image}
                  alt="FDP Content Visual"
                  className="w-full h-64 object-cover transition-transform duration-700 group-hover/image:scale-110"
                />

                {/* Overlay content */}
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 opacity-0 group-hover/image:opacity-100 transition-opacity duration-500">
                  <h4 className="text-white font-bold text-lg mb-2">
                    AI-Powered Learning
                  </h4>
                  <p className="text-gray-200 text-sm">
                    Experience cutting-edge technology firsthandw-full bg-gradient-to-br from-[#0a0f1c] via-[#1a1f2c] to-[#2a1f3c] py-16 px-4 md:px-16 relative overflow-hidden
                  </p>
                </div>

                {/* Corner badge */}
                <div className="absolute top-4 right-4 z-30 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Premium
                </div>
              </div>

              {/* Interactive Features Grid */}
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      hoveredFeature === index
                        ? "bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-400/50 scale-105"
                        : "bg-gray-800/30 border-gray-600/30 hover:border-green-500/30"
                    }`}
                    onMouseEnter={() => setHoveredFeature(index)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <div className="text-center space-y-2">
                      <div
                        className={`text-2xl transition-transform duration-300 ${
                          hoveredFeature === index ? "scale-125" : ""
                        }`}
                      >
                        {feature.icon}
                      </div>
                      <div className="text-white font-semibold text-sm">
                        {feature.title}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {feature.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Call to Action Box */}
              {/* <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-400/30 rounded-xl p-6 text-center">
                <div className="text-green-400 font-bold text-lg mb-2">Limited Seats!</div>
                <div className="text-gray-300 text-sm mb-4">Join 500+ educators already enrolled</div>
                <div className="flex justify-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: `${i * 0.2}s`}} />
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          {[
            { number: "500+", label: "Faculty Trained", icon: "👨‍🏫" },
            { number: "50+", label: "Universities", icon: "🏛️" },
            { number: "98%", label: "Success Rate", icon: "📈" },
            { number: "24/7", label: "Support", icon: "🛟" }
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-600/30 hover:border-green-400/30 transition-all duration-300 hover:scale-105">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-green-400 mb-1">{stat.number}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default ContentSection;
