import React, { useState, useEffect } from "react";

const GlobalInfoventuresShowcase = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const achievements = [
    {
      number: "24+",
      label: "Years of Excellence",
      icon: "🏆",
      color: "from-yellow-400 to-orange-500",
    },
    // { number: "1000+", label: "Projects Delivered", icon: "🚀", color: "from-blue-400 to-purple-500" },
    {
      number: "#1",
      label: "NVIDIA Academic Partner",
      icon: "🥇",
      color: "from-green-400 to-emerald-500",
    },
    // { number: "50+", label: "Global Clients", icon: "🌍", color: "from-cyan-400 to-blue-500" }
  ];

  const services = [
    {
      title: "AI Infrastructure Solutions",
      description:
        "Complete NVIDIA infrastructure setup and optimization for enterprise-grade AI applications",
      icon: "🔧",
      features: [
        "Hardware Installation",
        "Performance Optimization",
        "24/7 Support",
      ],
    },
    {
      title: "Workforce Training & Development",
      description:
        "Comprehensive training programs to harness NVIDIA technologies for innovation",
      icon: "🎓",
      features: [
        "Expert-led Sessions",
        "Hands-on Projects",
        "Certification Support",
      ],
    },
    {
      title: "Research & Innovation Support",
      description:
        "End-to-end support for AI research projects and product development initiatives",
      icon: "🔬",
      features: [
        "Research Guidance",
        "Technical Consulting",
        "Product Development",
      ],
    },
  ];

  const milestones = [
    {
      year: "2000",
      event: "Company Founded",
      desc: "Started journey in software solutions",
    },
    {
      year: "2010",
      event: "Technology Leadership",
      desc: "Established as industry innovator",
    },
    {
      year: "2021",
      event: "AI Transformation",
      desc: "Pivoted to AI and machine learning",
    },
    {
      year: "2024",
      event: "NVIDIA Partnership",
      desc: "Became Premier Academic Partner",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a1f2c] to-[#0f1729] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000" />

        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-float opacity-60"
            style={{
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animationDelay: Math.random() * 5 + "s",
              animationDuration: Math.random() * 3 + 4 + "s",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div
          className={`text-center mb-20 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full border border-green-400/30 mb-8 backdrop-blur-sm">
            <span className="text-green-400 font-bold text-lg">
              🚀 Since 2000 • Premier NVIDIA Academic Partner
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold mb-6 bg-gradient-to-r from-white via-green-300 to-blue-400 text-transparent bg-clip-text leading-tight">
            Global Infoventures
          </h1>

          <h2 className="text-2xl md:text-3xl font-semibold text-gray-300 mb-6">
            Leading Software Solutions Provider
          </h2>

          <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed mb-8">
            Blending high-end technology with innovative ideas to deliver
            world-class solutions for global applications, with uncompromising
            standards in quality and reliability.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full font-bold shadow-lg hover:scale-105 transition-transform duration-300">
              AI Infrastructure Expert
            </div>
            <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full font-bold shadow-lg hover:scale-105 transition-transform duration-300">
              Research & Development
            </div>
            <div className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full font-bold shadow-lg hover:scale-105 transition-transform duration-300">
              Enterprise Solutions
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="group relative p-8 bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-2xl border border-gray-600/30 hover:border-green-400/50 transition-all duration-500 hover:scale-105 backdrop-blur-sm"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${achievement.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}
              />
              <div className="relative text-center">
                <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">
                  {achievement.icon}
                </div>
                <div
                  className={`text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r ${achievement.color} text-transparent bg-clip-text`}
                >
                  {achievement.number}
                </div>
                <div className="text-gray-300 font-medium text-sm md:text-base">
                  {achievement.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* NVIDIA Partnership Highlight */}
        <div className="mb-20">
          <div className="relative p-8 md:p-12 bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-3xl border border-green-400/30 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+Cjwvc3ZnPg==')] opacity-20" />

            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-2/3">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-2xl">
                    🤝
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-green-300">
                      NVIDIA Academic Partnership
                    </h3>
                    <p className="text-gray-300">Premier Partner in India</p>
                  </div>
                </div>

                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  As the premier Academic Service Partner of NVIDIA in India, we
                  play a pivotal role in the AI ecosystem, supporting
                  organizations throughout their journey from installation of
                  NVIDIA infrastructure to enabling their workforce to
                  effectively harness the power of NVIDIA technologies.
                </p>

                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold border border-green-400/30">
                    Infrastructure Setup
                  </span>
                  <span className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold border border-blue-400/30">
                    Workforce Training
                  </span>
                  <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold border border-purple-400/30">
                    Research Support
                  </span>
                </div>
              </div>

              <div className="md:w-1/3 relative">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-6xl shadow-2xl animate-pulse">
                  🎯
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-3xl animate-bounce">
                  ⭐
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalInfoventuresShowcase;
