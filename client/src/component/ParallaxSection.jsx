import React, { useEffect, useState, useContext } from "react";
import ApiContext from "../context/ApiContext";

const ParallaxSection = () => {
  const [activeText, setActiveText] = useState("");
  const { fetchData, userToken } = useContext(ApiContext);

  useEffect(() => {
    fetchActiveParallaxText();
  }, []);
console.log(typeof yourParam)
  const fetchActiveParallaxText = async () => {
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
      // Optional: silently handle error or display to user
    }
  };

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
