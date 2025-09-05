import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ApiContext from "../context/ApiContext";
import images from "../constant/images.js";
import ParallaxSection from "../component/ParallaxSection";
import ContentSection from "../component/ContentSection";
import CommunityHighlights from "../component/CommunityHighlights";
import LogoMarquee from "../component/LogoMarquee";
import { TextParallax } from "../component/TextParallax.jsx";
import AboutCompany from "../component/AboutCompany.jsx";
import Swal from "sweetalert2";

const Home = () => {
  const { user, userToken, fetchData } = useContext(ApiContext);
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentIndexUS, setCurrentIndexUS] = useState(0);
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const usSlides = [
    images.us1,
    images.us2,
    images.us3,
    images.us4,
    images.us5,
    images.us6,
    images.us7,
    images.us9,
  ];

  useEffect(() => {
    // In your fetchHomeData function in Home.jsx
    const fetchHomeData = async () => {
      try {
        const response = await fetchData(
          "home/getHomePageContent",
          "GET",
          {},
          { "Content-Type": "application/json" }
        );

        if (response?.success) {
          setHomeData(response.data);
        } else {
          const errorMsg = response?.message || "Please Reload the Page";
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to load homepage";
        setError(errorMsg);
        Swal.fire("Error", errorMsg, "error");

        // Log detailed error in development
        if (process.env.NODE_ENV === "development") {
          console.error("API Error Details:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [fetchData]);

  // Auto-slide functionality (from your original code)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === usSlides.length - 1 ? 0 : prevIndex + 1
      );
      setCurrentIndexUS((prevIndex) =>
        prevIndex === usSlides.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [usSlides.length]);

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchWithRetry = async () => {
      try {
        await fetchHomeData();
      } catch (error) {
        if (retryCount < 2) {
          // Retry up to 2 times
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 2000); // Wait 2 seconds before retrying
        }
      }
    };

    fetchWithRetry();
  }, [retryCount]); // Add retryCount to dependency array

  const handleRedirect = () => navigate("/EventWorkshopPage");
  const handleRedirect01 = () => navigate("/Discussion");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-blue-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-blue-500 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Error loading content</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (userToken) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-black to-blue-500">
        <ParallaxSection data={homeData?.parallax} />
        <ContentSection data={homeData?.content} />
        <CommunityHighlights />
      </div>
    );
  }

  // Logged-out view (restored from your original code)
  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-black to-blue-500">
      <ParallaxSection data={homeData?.parallax} />
      <CommunityHighlights />
      <ContentSection data={homeData?.content} />
      <AboutCompany/>
    </div>
  );
};

export default Home;
