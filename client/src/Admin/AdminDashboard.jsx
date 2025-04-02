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
  const [quizMenuOpen, setQuizMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-black text-white p-4 flex justify-between items-center">
        <div className="text-2xl font-bold">Admin Dashboard</div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? 'block' : 'hidden'} md:block bg-black text-white w-full md:w-64 flex-shrink-0 transition-all duration-300 ease-in-out`}
        style={{ height: isMobile ? 'calc(100vh - 60px)' : '100vh' }}
      >
        <div className="p-4 text-2xl md:text-3xl font-bold hidden md:block">Admin Dashboard</div>
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
            {/* Quiz Section */}
            <li>
              <div
                className="py-3 px-4 cursor-pointer flex items-center text-lg md:text-xl"
                onClick={() => setQuizMenuOpen(!quizMenuOpen)}
              >
                <FaBrain className="mr-4" />
                Quiz
                {quizMenuOpen ? (
                  <FaAngleUp className="ml-auto" />
                ) : (
                  <FaAngleDown className="ml-auto" />
                )}
              </div>
            </li>
            {quizMenuOpen && (
              <ul className="ml-6">
                <li>
                  <div
                    className={`py-2 px-4 cursor-pointer flex items-center text-base md:text-lg ${
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
                    className={`py-2 px-4 cursor-pointer flex items-center text-base md:text-lg ${
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
                    className={`py-2 px-4 cursor-pointer flex items-center text-base md:text-lg ${
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
                    className={`py-2 px-4 cursor-pointer flex items-center text-base md:text-lg ${
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
            )}

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

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-x-auto">
        {getComp(activeComp)}
      </div>
    </div>
  );
};

export default AdminDashboard;