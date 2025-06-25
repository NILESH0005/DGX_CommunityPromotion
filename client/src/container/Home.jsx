import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import ApiContext from "../context/ApiContext";
import images from "../constant/images.js";
import ParallaxSection from "../component/ParallaxSection";
import ContentSection from "../component/ContentSection";
import NewsSection from "../component/NewsSection";
import ProjectShowcase from "../component/ProjectShowcase";
import CommunityHighlights from "../component/CommunityHighlights";
import LogoMarquee from "../component/LogoMarquee";
import { TextParallax } from "../component/TextParallax.jsx";
import Swal from "sweetalert2";

const Home = () => {
  const { user, userToken } = useContext(ApiContext);
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentIndexUS, setCurrentIndexUS] = useState(0);

  // Slides data
  // const slides = [images.us2, images.us3, images.us4, images.us5];

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

  const people = [
    {
      name: "Ashiwini Thakur",
      role: "Project Manager",
      imageUrl: `${images.AshwiniSir}`,
    },
    {
      name: "Sharad Srivastav",
      role: "Project Manager",
      imageUrl: `${images.SharadSir}`,
    },
    {
      name: "Anubhav Patrick",
      role: "Project Manager",
      imageUrl: `${images.PatrickSir}`,
    },
    {
      name: "Sugandh Gupta",
      role: "Project Manager",
      imageUrl: `${images.SugandhMaam}`,
    },
  ];

  // Auto-slide functionality
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
  }, [usSlides .length, usSlides.length]);

  const handleRedirect = () => navigate("/EventWorkshopPage");
  const handleRedirect01 = () => navigate("/Discussion");

  if (userToken) {
    // Logged-in view
    return (
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-black to-blue-500">
        <ParallaxSection />
        <ContentSection />
        {/* <NewsSection />
        <ProjectShowcase /> */}
        <CommunityHighlights />
      </div>
    );
  }

  // Logged-out view
  return (
    <div>
      {/* Hero Section */}
      <div
        className="relative py-14 sm:py-24 bg-cover bg-center"
        style={{ backgroundImage: `url(${images.HeroImg})` }}
      >
        <div className="absolute inset-0 bg-DGXblack opacity-50"></div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-8 flex justify-center">
            <p className="relative rounded-full px-4 py-1.5 text-DGXwhite leading-6 bg-DGXgreen ring-1 ring-inset ring-[#111827]/10 hover:ring-[#111827]/20 hover:bg-DGXblue">
              <Link to="/SignInn" className="font-semibold text-DGXwhite">
                <span className="absolute inset-0"></span> Join Us Today{" "}
                <span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </span>
              </Link>
            </p>
          </div>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-DGXwhite sm:text-6xl">
              DGX - COMMUNITY
            </h1>
            <p className="mt-6 text-lg leading-8 text-DGXwhite">
              <i>Connect, Innovate, Automate</i>: DGX Community Elevates AI
              Development
            </p>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <section className="bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-items-center gap-4 bg-DGXblue p-4">
          <div className="flex flex-col justify-center items-center bg-DGXblue opacity-100 w-full h-full p-4 md:p-6 lg:p-10">
            <div className="text-center">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-DGXwhite">
                Welcome to the DGX Community!
              </h1>
              <h2 className="text-DGXwhite font-bold">
                Your Hub for Innovation, Collaboration, and Learning
              </h2>
              <p className="mt-4 text-sm sm:text-base md:text-lg lg:text-xl leading-6 text-DGXwhite">
                We're thrilled to have you here! Explore our community platform
                where students, researchers, and professionals come together to
                share knowledge, stay updated on the latest in AI and ML, and
                connect with like-minded individuals.
              </p>
            </div>
          </div>

          {/* About Us Carousel */}
          <div className="relative w-full h-52 md:h-[400px] lg:h-[400px] rounded-lg overflow-hidden">
            <div className="relative h-full">
              {usSlides.map((usSlides, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === currentIndexUS ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={usSlides}
                    alt={`US Slide ${index}`}
                    className="object-fill w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 lg:p-8">
          <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
            <div className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-DGXgreen via-DGXblack to-DGXblue bg-clip-text text-transparent animate-pulse">
                Upcoming Events
              </span>
              <p className="mt-2 text-sm md:text-base lg:text-lg text-DGXblue">
                Attend our regular events and workshops to learn from the best
                in the industry. Enhance your skills and network with
                professionals.
              </p>
            </div>
            <button
              onClick={handleRedirect}
              className="text-sm md:text-md lg:text-lg bg-DGXgreen text-DGXwhite py-2 px-4 lg:py-2 lg:px-5 border border-DGXblue rounded-md mt-4 hover:bg-[#27272a] transition-colors duration-300"
            >
              Enroll Now
            </button>
          </div>

          {/* Events Carousel */}
          <div className="relative w-full h-64 md:h-[500px] lg:h-[500px] rounded-lg overflow-hidden">
            <div className="relative h-full">
              {usSlides.map((usSlides, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === currentIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={usSlides}
                    alt={`Slide ${index}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <TextParallax />
      {/* Leadership Section */}
      {/* <div className="bg-DGXgray/50 py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-20 px-6 lg:px-8 xl:grid-cols-3">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
              Meet our leadership
            </h2>
            <p className="mt-6 text-justify text-lg leading-8 text-[#4b5563]">
              "Our leaders are shaping the future with unparalleled expertise,
              harnessing the revolutionary NVIDIA DGX system to drive
              groundbreaking advancements in AI."
            </p>
          </div>
          <ul
            role="list"
            className="p-6 grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-2"
          >
            {people.map((person) => (
              <li key={person.name}>
                <div className="flex items-center gap-x-6">
                  <img
                    alt=""
                    src={person.imageUrl}
                    className="h-16 w-16 rounded-full"
                  />
                  <div>
                    <h3 className="text-base font-semibold leading-7 tracking-tight text-[#111827]">
                      {person.name}
                    </h3>
                    <p className="text-sm font-semibold leading-6 text-[#4f46e5]">
                      {person.role}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div> */}

      {/* Partners Section */}
      <div className="bg-white py-24 sm:py-32 w-full">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h1 className="text-center text-2xl font-bold leading-8 text-DGXblue mb-20">
            NVIDIA DGX systems are at the forefront of AI research...
          </h1>
        </div>
        {/* Remove any padding/margin constraints from the parent */}
        <div className="w-full overflow-hidden">
          <LogoMarquee />
        </div>
      </div>
    </div>
  );
};

export default Home;