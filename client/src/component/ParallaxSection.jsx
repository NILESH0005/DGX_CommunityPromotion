import React, { useEffect, useState, useContext } from "react";
import ApiContext from "../context/ApiContext";

const ParallaxSection = () => {
  const [activeText, setActiveText] = useState(""); // State to store the active text
  const { fetchData, userToken } = useContext(ApiContext);
  console.log("usertoken:", userToken)
  useEffect(() => {

    fetchActiveParallaxText();

  }, []);


  const fetchActiveParallaxText = async () => {
    const endpoint = "home/getParallaxContent";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      // "auth-token": userToken,
    };

    console.log("headers", headers);
    const body = {};

    try {
      const response = await fetchData(endpoint, method, body, headers);
      console.log("Response:", response);

      if (response.success) {
        const active = response.data.find((text) => text.isActive);
        if (active) {
          setActiveText(active.Content);
        }
      } else {
        console.error("Error:", response.message);
      }
    } catch (error) {
      console.error("API Request Error:", error);
    }
  };
  console.log("parallex content :", activeText);

  useEffect(() => {
    const handleScroll = () => {
      const value = window.scrollY;
      document.getElementById("circuit_board").style.left = value * 0.5 + "px";
      document.getElementById("text").style.marginRight = value * 4 + "px";
      document.getElementById("text").style.marginTop = value * 1.5 + "px";
      document.getElementById("btn").style.marginTop = value * 1.5 + "px";
      document.querySelector("header").style.top = value * 0.5 + "px";
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative w-full h-screen flex justify-center items-center overflow-hidden">
      <img
        src="stars.png"
        id="circuit_board"
        alt="Circuit Board"
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
      />
      <h2 id="text" className="absolute text-white text-8xl whitespace-nowrap z-10">
        {activeText}
      </h2>
      {!userToken && (
        <a
          href="/VerifyEmail"
          id="btn"
          className="absolute bg-white text-purple-900 px-8 py-4 rounded-full text-xl z-10 transform translate-y-24"
        >
          Join Us
        </a>
      )}
      <img
        src="bg0.png"
        id="tech_wave"
        alt="Tech Wave"
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
      />
    </section>
  );
};

export default ParallaxSection;