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
      color: "from-DGXblue to-DGXgreen",
    },
    {
      number: "#1",
      label: "NVIDIA Academic Partner",
      icon: "🥇",
      color: "from-DGXblue to-DGXgreen",
    },
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
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-green-50 text-DGXblue relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-200 rounded-full opacity-30 mix-blend-multiply filter blur-3xl" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-200 rounded-full opacity-25 mix-blend-multiply filter blur-3xl" />

        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-DGXblue to-DGXgreen rounded-full animate-float opacity-60"
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
        

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-DGXblue leading-tight">
            Global Infoventures
          </h1>

          <h2 className="text-2xl md:text-3xl font-semibold text-DGXgreen mb-6">
            Leading Software Solutions Provider
          </h2>

          <p className="text-xl text-DGXblue/80 max-w-4xl mx-auto leading-relaxed mb-8">
            Blending high-end technology with innovative ideas to deliver
            world-class solutions for global applications, with uncompromising
            standards in quality and reliability.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-1.5 rounded-full text-sm font-semibold text-DGXblue bg-gradient-to-r from-blue-50 to-green-50 border border-DGXblue/30 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-DGXblue"></span>
              AI Infrastructure Expert
            </span>

            <span className="px-4 py-1.5 rounded-full text-sm font-semibold text-DGXblue bg-gradient-to-r from-blue-50 to-green-50 border border-DGXblue/30 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-DGXblue"></span>
              Research & Development
            </span>

            <span className="px-4 py-1.5 rounded-full text-sm font-semibold text-DGXblue bg-gradient-to-r from-blue-50 to-green-50 border border-DGXblue/30 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-DGXblue"></span>
              Enterprise Solutions
            </span>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 gap-6 mb-20">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="group relative p-8 bg-white rounded-2xl border border-gray-200 hover:border-DGXgreen/50 transition-all duration-500 hover:scale-105 shadow-md"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${achievement.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}
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
                <div className="text-DGXblue font-medium text-sm md:text-base">
                  {achievement.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* NVIDIA Partnership Highlight */}
        <div className="mb-20">
          <div className="relative p-8 md:p-12 bg-gradient-to-br from-DGXblue/10 to-DGXgreen/10 rounded-3xl border border-DGXgreen/30 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgwLDAsMCwwLjEpIi8+Cjwvc3ZnPg==')] opacity-20" />

            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-2/3">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-DGXblue to-DGXgreen rounded-full flex items-center justify-center text-2xl text-white">
                    🤝
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-DGXgreen">
                      NVIDIA Academic Partnership
                    </h3>
                    <p className="text-DGXblue">Premier Partner in India</p>
                  </div>
                </div>

                <p className="text-lg text-DGXblue leading-relaxed mb-6">
                  As the premier Academic Service Partner of NVIDIA in India, we
                  play a pivotal role in the AI ecosystem, supporting
                  organizations throughout their journey from installation of
                  NVIDIA infrastructure to enabling their workforce to
                  effectively harness the power of NVIDIA technologies.
                </p>

                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-DGXblue/10 text-DGXblue rounded-full text-sm font-semibold border border-DGXblue/30">
                    Infrastructure Setup
                  </span>
                  <span className="px-4 py-2 bg-DGXblue/10 text-DGXblue rounded-full text-sm font-semibold border border-DGXblue/30">
                    Workforce Training
                  </span>
                  <span className="px-4 py-2 bg-DGXblue/10 text-DGXblue rounded-full text-sm font-semibold border border-DGXblue/30">
                    Research Support
                  </span>
                </div>
              </div>

              <div className="md:w-1/3 relative">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-DGXblue to-DGXgreen rounded-full flex items-center justify-center text-6xl text-white shadow-2xl">
                  🎯
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-DGXblue to-DGXgreen rounded-full flex items-center justify-center text-3xl text-white">
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