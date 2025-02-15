import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const modules = [
  {
    title: "Discussions",
    description: "Engage in meaningful conversations and share knowledge with the community.",
    date: "March 20, 2025",
    category: "Discussion",
    image: "https://picsum.photos/400/300",
  },
  {
    title: "Blogs",
    description: "Read insightful articles and stay updated with the latest trends.",
    date: "April 5, 2025",
    category: "Blog",
    image: "https://picsum.photos/400/303",
  },
  {
    title: "Events",
    description: "Join exciting events, meet industry experts, and expand your network.",
    date: "April 15, 2025",
    category: "Event",
    image: "https://picsum.photos/400/304",
  },
  {
    title: "Workshops",
    description: "Enhance your skills with hands-on workshops and training sessions.",
    date: "April 25, 2025",
    category: "Workshop",
    image: "https://picsum.photos/400/307",
  }
];

const CommunityHighlight = () => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: 420, behavior: "smooth" });
        if (
          scrollRef.current.scrollLeft + scrollRef.current.clientWidth >=
          scrollRef.current.scrollWidth
        ) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        }
      }
    }, 3000);

    return () => clearInterval(scrollInterval);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#3A1C83] flex flex-col items-center py-16 px-8 overflow-hidden">
      {/* Heading */}
      <div className="w-full max-w-6xl flex flex-col sm:flex-row sm:items-center sm:justify-between text-white mb-10">
        <h1 className="text-5xl font-extrabold">Community Highlight</h1>
        <p className="text-xl text-gray-300 mt-2 sm:mt-0">Covering March & April 2025</p>
      </div>

      {/* Horizontal Scrolling Cards */}
      <motion.div
        ref={scrollRef}
        className="w-full max-w-7xl flex space-x-8 py-6 overflow-x-hidden"
        whileTap={{ cursor: "grabbing" }}
      >
        {modules.map((module, index) => (
          <motion.div
            key={index}
            className="relative bg-white rounded-3xl overflow-hidden shadow-lg w-[400px] flex-shrink-0"
            whileHover={{ scale: 1.05, y: -10, boxShadow: "0px 20px 30px rgba(0, 0, 0, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            {/* Image & Category Label */}
            <div className="relative">
              <img src={module.image} alt={module.title} className="w-full h-96 object-cover" />
              <span className="absolute top-4 left-4 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                {module.category.toUpperCase()}
              </span>
            </div>

            {/* Card Content */}
            <div className="p-8">
              <p className="text-md text-gray-500">{module.date}</p>
              <h3 className="text-2xl font-bold text-gray-900">{module.title}</h3>
              <p className="text-gray-700 mt-3 text-lg">{module.description}</p>

              {/* CTA Link */}
              <a
                href="#"
                className="mt-6 inline-flex items-center text-indigo-600 text-lg font-semibold group transition-all"
              >
                Find out more
                <span className="ml-2 transition-all duration-300 transform group-hover:translate-x-1">→</span>
              </a>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default CommunityHighlight;
