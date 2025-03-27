import React from "react";

// Define the cn function locally
const cn = (...classes) => classes.filter(Boolean).join(" ");

const QuizPalette = ({
  questionStatus,
  currentQuestion,
  setCurrentQuestion,
  timer,
  totalQuestions,
  onSubmitQuiz,
}) => {
  const getStatusClass = (status, questionNumber) => {
    if (questionNumber === currentQuestion + 1) {
      return "bg-red-500 text-white ring-2 ring-offset-2 ring-red-500";
    }
    switch (status) {
      case "answered":
        return "bg-green-500 text-white";
      case "not-answered":
        return "bg-red-500 text-white";
      case "marked":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };
  return (
    <div className="lg:col-span-1 bg-gray-100 rounded-md p-4">
      <div className="mb-6">
        <div className="grid grid-cols-3 text-center">
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{timer.hours}</span>
            <span className="text-xs text-gray-500">Hour</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{timer.minutes}</span>
            <span className="text-xs text-gray-500">Minutes</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{timer.seconds}</span>
            <span className="text-xs text-gray-500">Seconds</span>
          </div>
        </div>
        <div className="mt-2 text-gray-700">user name</div>
      </div>
      <div className="mb-6">
        <h3 className="text-gray-700 mb-2">Question Palette:</h3>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(
            (num) => (
              <button
                key={num}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded text-sm",
                  getStatusClass(questionStatus[num] || "not-visited", num)
                )}
                onClick={() => setCurrentQuestion(num - 1)}
              >
                {num}
              </button>
            )
          )}
        </div>
      </div>
      <div className="mb-6">
        <h3 className="text-gray-700 mb-2">Legend:</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
              ✓
            </div>
            <span className="text-sm">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
              2
            </div>
            <span className="text-sm">Not Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">
              !
            </div>
            <span className="text-sm">Marked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 text-xs">
              0
            </div>
            <span className="text-sm">Not Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 text-xs">
              0
            </div>
            <span className="text-sm">Answered & Marked for Review</span>
          </div>
        </div>
      </div>
      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          onClick={onSubmitQuiz}
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizPalette;
