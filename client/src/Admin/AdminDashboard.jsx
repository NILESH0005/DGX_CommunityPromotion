import React, { useState, useEffect } from "react";
import Users from "./Components/Users";
import Discussions from "./Components/Discussions";
import Events from "./Components/Events";
import GuidelineManager from "./Components/GuidelineManager";
import Contact from "./Components/Contact";
import BlogManager from "./Components/BlogManager";
import Home from "./Components/Home";
import QuizPanel from "./Components/Quiz/QuizPanel";
import QuestionBank from "./Components/Quiz/QuestionBank";
import QuizMapping from "./Components/Quiz/QuizMapping";
import QuizSettings from "./Components/Quiz/QuizSettings";
import {
  FaUsers,
  FaComments,
  FaCalendarAlt,
  FaBlog,
  FaQuestionCircle,
  FaList,
  FaBrain,
  FaChartPie,
  FaCog,
  FaBook,
  FaHome,
  FaEnvelope,
  FaAngleDown,
  FaAngleUp,
  FaBars,
  FaTimes
} from "react-icons/fa";

const AdminDashboard = (props) => {
  const [activeComp, setActiveComp] = useState("users");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On larger screens, always show sidebar
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false); // Close sidebar by default on mobile
      }
    };

    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getComp = (comp) => {
    switch (comp) {
      case "users":
        return <Users />;
      case "discussions":
        return <Discussions />;
      case "events":
        return <Events events={props.events} setEvents={props.setEvents} />;
      case "blog_manager":
        return <BlogManager blogs={props.blogs} setBlogs={props.setBlogs} />;
      case "quizpanel":
        return <QuizPanel setActiveComp={setActiveComp} />;
      case "quiz_bank":
        return <QuestionBank />;
      case "quiz_mapping":
        return <QuizMapping />;
      case "quiz_settings":
        return <QuizSettings />;
      case "guidelines":
        return <GuidelineManager />;
      case "Home":
        return <Home />;
      case "contact":
        return <Contact />;
      default:
        return <Home />;
    }
  };

  const handleMenuItemClick = (comp) => {
    setActiveComp(comp);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Mobile Header */}
      <div className="md:hidden bg-black text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="text-2xl font-bold">Admin Dashboard</div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="text-white focus:outline-none"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Sidebar - Changed positioning for mobile */}
      <div 
        className={`fixed md:relative top-16 md:top-0 left-0 h-[calc(100vh-64px)] md:h-auto bg-black text-white w-64 flex-shrink-0 
        transform transition-transform duration-300 ease-in-out z-40 md:z-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <nav className="overflow-y-auto h-full">
          <ul>
            <li>
              <div
                className={`py-3 px-4 cursor-pointer flex items-center text-lg md:text-xl ${
                  activeComp === "users" ? "bg-gray-700 text-yellow-300" : ""
                }`}
                onClick={() => handleMenuItemClick("users")}
              >
                <FaUsers className="mr-4" />
                Users
              </div>
            </li>
            <li>
              <div
                className={`py-3 px-4 cursor-pointer flex items-center text-lg md:text-xl ${
                  activeComp === "discussions"
                    ? "bg-gray-700 text-yellow-300"
                    : ""
                }`}
                onClick={() => handleMenuItemClick("discussions")}
              >
                <FaComments className="mr-4" />
                Discussions
              </div>
            </li>
            <li>
              <div
                className={`py-3 px-4 cursor-pointer flex items-center text-lg md:text-xl ${
                  activeComp === "events" ? "bg-gray-700 text-yellow-300" : ""
                }`}
                onClick={() => handleMenuItemClick("events")}
              >
                <FaCalendarAlt className="mr-4" />
                Events
              </div>
            </li>
            <li>
              <div
                className={`py-3 px-4 cursor-pointer flex items-center text-lg md:text-xl ${
                  activeComp === "blog_manager"
                    ? "bg-gray-700 text-yellow-300"
                    : ""
                }`}
                onClick={() => handleMenuItemClick("blog_manager")}
              >
                <FaBlog className="mr-4" />
                Blogs
              </div>
            </li>
            {/* Quiz Section with Hover-based Submenu */}
            <li className="relative group">
              <div
                className={`py-3 px-4 cursor-pointer flex items-center text-lg md:text-xl ${
                  ["quizpanel", "quiz_bank", "quiz_mapping", "quiz_settings"].includes(activeComp)
                    ? "bg-gray-700 text-yellow-300"
                    : ""
                }`}
              >
                <FaBrain className="mr-4" />
                Quiz
                <FaAngleDown className="ml-auto group-hover:rotate-180 transition-transform duration-200" />
              </div>
              <ul className="bg-gray-800 absolute hidden group-hover:block w-full left-0 top-full z-10">
                <li>
                  <div
                    className={`py-2 px-6 cursor-pointer flex items-center text-base md:text-lg ${
                      activeComp === "quizpanel"
                        ? "bg-gray-700 text-yellow-300"
                        : ""
                    }`}
                    onClick={() => handleMenuItemClick("quizpanel")}
                  >
                    <FaQuestionCircle className="mr-4" />
                    Quiz Panel
                  </div>
                </li>
                <li>
                  <div
                    className={`py-2 px-6 cursor-pointer flex items-center text-base md:text-lg ${
                      activeComp === "quiz_bank"
                        ? "bg-gray-700 text-yellow-300"
                        : ""
                    }`}
                    onClick={() => handleMenuItemClick("quiz_bank")}
                  >
                    <FaList className="mr-4" />
                    Question Bank
                  </div>
                </li>
                <li>
                  <div
                    className={`py-2 px-6 cursor-pointer flex items-center text-base md:text-lg ${
                      activeComp === "quiz_mapping"
                        ? "bg-gray-700 text-yellow-300"
                        : ""
                    }`}
                    onClick={() => handleMenuItemClick("quiz_mapping")}
                  >
                    <FaChartPie className="mr-4" />
                    Quiz Mapping
                  </div>
                </li>
                <li>
                  <div
                    className={`py-2 px-6 cursor-pointer flex items-center text-base md:text-lg ${
                      activeComp === "quiz_settings"
                        ? "bg-gray-700 text-yellow-300"
                        : ""
                    }`}
                    onClick={() => handleMenuItemClick("quiz_settings")}
                  >
                    <FaCog className="mr-4" />
                    Quiz Settings
                  </div>
                </li>
              </ul>
            </li>

            <li>
              <div
                className={`py-3 px-4 cursor-pointer flex items-center text-lg md:text-xl ${
                  activeComp === "guidelines"
                    ? "bg-gray-700 text-yellow-300"
                    : ""
                }`}
                onClick={() => handleMenuItemClick("guidelines")}
              >
                <FaBook className="mr-4" />
                Guidelines
              </div>
            </li>
            <li>
              <div
                className={`py-3 px-4 cursor-pointer flex items-center text-lg md:text-xl ${
                  activeComp === "Home" ? "bg-gray-700 text-yellow-300" : ""
                }`}
                onClick={() => handleMenuItemClick("Home")}
              >
                <FaHome className="mr-4" />
                Home page
              </div>
            </li>
            <li>
              <div
                className={`py-3 px-4 cursor-pointer flex items-center text-lg md:text-xl ${
                  activeComp === "contact" ? "bg-gray-700 text-yellow-300" : ""
                }`}
                onClick={() => handleMenuItemClick("contact")}
              >
                <FaEnvelope className="mr-4" />
                Contact Us
              </div>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content - Added margin-top for mobile */}
      <div className={`flex-1 min-h-screen p-4 md:p-6 overflow-x-auto transition-all duration-300 mt-16 md:mt-0 ${
        sidebarOpen && isMobile ? 'ml-64' : ''
      }`}>
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          {getComp(activeComp)}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;