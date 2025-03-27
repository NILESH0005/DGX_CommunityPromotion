import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Confetti from "react-confetti";
import { FaTrophy, FaClock, FaChartBar } from "react-icons/fa";

const QuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quiz, score, totalQuestions, answers, correctAnswers, timeTaken } = location.state || {};

  const [showResult, setShowResult] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowResult(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const getPerformanceMessage = () => {
    if (percentage >= 80) return "Outstanding Performance! 🏆";
    if (percentage >= 60) return "Great Job! Keep Improving!";
    if (percentage >= 40) return "Good Attempt! Practice More!";
    return "Keep Trying! You'll Get Better!";
  };

  const getPerformanceColor = () => {
    if (percentage >= 80) return "text-emerald-500";
    if (percentage >= 60) return "text-blue-500";
    if (percentage >= 40) return "text-amber-500";
    return "text-red-500";
  };

  const handleBackToQuizzes = () => {
    navigate('/QuizInterface'); // Change this to your quizzes route
  };

  // Add fallback values in case location.state is undefined
  const displayScore = score || 0;
  const displayTotalQuestions = totalQuestions || 1;
  const displayCorrectAnswers = correctAnswers || 0;
  const displayTimeTaken = timeTaken || "0m 0s";
  const percentage = Math.round((displayCorrectAnswers / totalQuestions) * 100);


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {percentage >= 80 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {showResult && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            className="bg-white p-8 rounded-3xl shadow-xl w-full"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${percentage >= 80 ? "bg-gradient-to-r from-yellow-400 to-amber-500" : "bg-gradient-to-r from-blue-400 to-indigo-500"} text-white text-4xl font-bold mb-4 shadow-lg`}
              >
                {percentage}%
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h1>
              <p className={`text-xl font-semibold ${getPerformanceColor()} mb-6`}>
                {getPerformanceMessage()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <div className="flex justify-center text-blue-500 mb-2">
                  <FaChartBar size={24} />
                </div>
                <h3 className="font-semibold text-gray-700">Score</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {displayCorrectAnswers} / {displayTotalQuestions}
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl text-center">
                <div className="flex justify-center text-amber-500 mb-2">
                  <FaClock size={24} />
                </div>
                <h3 className="font-semibold text-gray-700">Time Taken</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {displayTimeTaken}
                </p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl text-center">
                <div className="flex justify-center text-emerald-500 mb-2">
                  <FaTrophy size={24} />
                </div>
                <h3 className="font-semibold text-gray-700">Correct</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {displayCorrectAnswers}
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToQuizzes}
                className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Back to Quizzes
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default QuizResult;