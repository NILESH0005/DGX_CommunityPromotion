import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import ApiContext from "../context/ApiContext";
import Quiz from "./quiz/Quiz";
import Swal from "sweetalert2";

const QuizInterface = () => {
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const navigate = useNavigate();
  const { userToken, user } = useContext(ApiContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const slides = [
    "Prepare for your exams with ease!",
    "Test your knowledge with interactive quizzes.",
    "Join now and start your quiz journey!",
  ];

  useEffect(() => {
    if (userToken && user) {
      setIsLoggedIn(true);
      console.log(user);
    } else {
      setIsLoggedIn(false);
    }
  }, [user, userToken]);

  const handleStartQuiz = () => {
    if (!isLoggedIn) {
      Swal.fire({
        title: "Login Required",
        text: "You need to log in first to start a quiz.",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/SignInn");
        }
      });
    } else {
      navigate("/QuizList"); 
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-100 p-6 relative">
      <img
        src="quiz.jpg"
        alt="Exam Test"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-50"
      />

      <div className="relative z-10 flex flex-col items-center text-center w-full">
        {showCreateQuiz ? (
          <Quiz onBack={() => setShowCreateQuiz(false)} />
        ) : (
          <>
            <h1 className="text-6xl font-bold text-white">
              WELCOME TO <span className="text-blue-600">QUIZZ</span>
            </h1>

            <div className="flex flex-col md:flex-row items-center mt-6 bg-white p-6 rounded-lg shadow-md max-w-4xl w-full">
              <div className="md:w-1/2 text-left">
                <h2 className="text-2xl font-bold text-gray-800">
                  Exam Test Landing Page
                </h2>
                <p className="text-gray-600 mt-2">
                  Explore a variety of quizzes, track your progress, and enhance
                  your learning with real-time feedback.
                </p>

                <button
                  className="mt-6 bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition transform hover:scale-105"
                  onClick={handleStartQuiz}
                >
                  Start a Quiz
                </button>
              </div>

              <div className="md:w-1/2 flex justify-center">
                <img
                  src="exam.jpg"
                  alt="Exam Test"
                  className="w-full h-auto object-cover rounded-lg"
                />
              </div>
            </div>

            <div className="mt-8 `w-screen` w-full">
              <Carousel
                showThumbs={false}
                showStatus={false}
                showIndicators={true}
                autoPlay
                infiniteLoop
                interval={3000}
                swipeable
                emulateTouch
                className="w-full"
              >
                {slides.map((text, index) => (
                  <div
                    key={index}
                    className="p-8 font-bold text-3xl font-sans hover:bg-gray-200 transition duration-300 cursor-pointer"
                  >
                    {text}
                  </div>
                ))}
              </Carousel>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizInterface;