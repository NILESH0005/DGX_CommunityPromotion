import React, { useEffect, useState, useContext, useCallback } from "react";
import ApiContext from "../context/ApiContext";

const ParallaxSection = () => {
  const [activeText, setActiveText] = useState("");
  const { fetchData, userToken } = useContext(ApiContext);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const fetchActiveParallaxText = useCallback(async () => {
    const endpoint = "home/getParallaxContent";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      // "auth-token": userToken,
    };
    const body = {};

    try {
      const response = await fetchData(endpoint, method, body, headers);
      if (response.success) {
        const active = response.data.find((text) => text.isActive);
        if (active) {
          setActiveText(active.Content);
        }
      }
    } catch (error) {
      console.error("Error fetching parallax content:", error);
    }
  }, [fetchData]);

  useEffect(() => {
    fetchActiveParallaxText();

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fetchActiveParallaxText]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const text = document.getElementById("text");
      const circuit = document.getElementById("circuit_board");
      const wave = document.getElementById("tech_wave");

      // Adjust parallax effects based on screen size
      const parallaxFactorText = windowSize.width > 768 ? 1.5 : 0.8;
      const parallaxFactorCircuit = windowSize.width > 768 ? 0.5 : 0.3;
      const parallaxFactorWave = windowSize.width > 768 ? 0.3 : 0.2;

      if (text) text.style.transform = `translateY(${scrollY * parallaxFactorText}px)`;
      if (circuit) circuit.style.transform = `translateY(${scrollY * parallaxFactorCircuit}px)`;
      if (wave) wave.style.transform = `translateY(${scrollY * parallaxFactorWave}px)`;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [windowSize]);

  // Calculate responsive text size
  const getTextSize = () => {
    if (windowSize.width < 640) return "text-4xl"; // mobile
    if (windowSize.width < 768) return "text-5xl"; // small tablet
    if (windowSize.width < 1024) return "text-7xl"; // tablet
    return "text-9xl"; // desktop
  };

  // Calculate button size and position
  const getButtonStyle = () => {
    if (windowSize.width < 640) {
      return "px-6 py-3 text-lg transform translate-y-16"; // mobile
    }
    return "px-8 py-4 text-xl transform translate-y-24"; // desktop
  };

  return (
    <section className="relative w-full h-screen flex justify-center items-center overflow-hidden">
      <img
        src="stars.png"
        id="circuit_board"
        alt="Circuit Board"
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
        loading="lazy"
      />
      <h2
        id="text"
        className={`absolute text-white ${getTextSize()} z-10 px-4 text-center`}
        style={{
          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
          wordBreak: "break-word",
        }}
      >
        {activeText}
      </h2>
      {!userToken && (
        <a
          href="/VerifyEmail"
          id="btn"
          className={`absolute bg-white text-purple-900 rounded-full z-10 ${getButtonStyle()}`}
        >
          Join Us
        </a>
      )}
      <img
        src="bg0.png"
        id="tech_wave"
        alt="Tech Wave"
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
        loading="lazy"
      />
    </section>
  );
};

export default ParallaxSection;