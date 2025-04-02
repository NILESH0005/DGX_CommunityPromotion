import React from 'react';

const ViewQuizModal = ({ quiz, onClose, getCategoryName, getLevelName, formatDateTime }) => {
  // Dummy data for questions and answers
  const dummyQuestions = [
    {
      id: 1,
      questionText: "What is the capital of France?",
      questionType: "Multiple Choice",
      points: 5,
      answers: [
        { id: 1, answerText: "London", isCorrect: false },
        { id: 2, answerText: "Paris", isCorrect: true },
        { id: 3, answerText: "Berlin", isCorrect: false },
        { id: 4, answerText: "Madrid", isCorrect: false }
      ]
    },
    {
      id: 2,
      questionText: "Which of these are programming languages? (Select all that apply)",
      questionType: "Multiple Select",
      points: 10,
      answers: [
        { id: 1, answerText: "HTML", isCorrect: false },
        { id: 2, answerText: "Python", isCorrect: true },
        { id: 3, answerText: "CSS", isCorrect: false },
        { id: 4, answerText: "JavaScript", isCorrect: true }
      ]
    },
    {
      id: 3,
      questionText: "The Earth is flat.",
      questionType: "True/False",
      points: 3,
      answers: [
        { id: 1, answerText: "True", isCorrect: false },
        { id: 2, answerText: "False", isCorrect: true }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-lg p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Centered Quiz Name Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold">{quiz.QuizName || "Quiz Report"}</h2>
        </div>
        
        {/* Quiz Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
            <p><span className="font-semibold">Category:</span> {getCategoryName(quiz.QuizCategory) || "General Knowledge"}</p>
            <p><span className="font-semibold">Level:</span> {getLevelName(quiz.QuizLevel) || "Intermediate"}</p>
            <p><span className="font-semibold">Duration:</span> {quiz.QuizDuration || 30} mins</p>
            <p><span className="font-semibold">Negative Marking:</span> {quiz.NegativeMarking ? "Yes" : "No"}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Timing & Visibility</h3>
            <p><span className="font-semibold">Start Date:</span> {formatDateTime(quiz.StartDateAndTime) || "2023-11-15 09:00 AM"}</p>
            <p><span className="font-semibold">End Date:</span> {formatDateTime(quiz.EndDateTime) || "2023-11-15 10:30 AM"}</p>
            <p><span className="font-semibold">Visibility:</span> {quiz.QuizVisibility || "Public"}</p>
            <p><span className="font-semibold">Total Questions:</span> {dummyQuestions.length}</p>
          </div>
        </div>
        
        {/* Questions and Answers Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Questions & Answers</h3>
          
          <div className="space-y-6">
            {dummyQuestions.map((question, qIndex) => (
              <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">
                    <span className="text-gray-600">Q{qIndex + 1}: </span>
                    {question.questionText}
                  </h4>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {question.points} pts
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">Type: {question.questionType}</p>
                
                <div className="ml-4 space-y-2">
                  {question.answers.map((answer) => (
                    <div 
                      key={answer.id} 
                      className={`flex items-center p-2 rounded ${answer.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-white'}`}
                    >
                      <input 
                        type={question.questionType === "Multiple Select" ? "checkbox" : "radio"} 
                        checked={answer.isCorrect}
                        readOnly
                        className={`mr-2 ${answer.isCorrect ? 'accent-green-500' : 'accent-gray-400'}`}
                      />
                      <span className={answer.isCorrect ? 'font-medium text-green-700' : 'text-gray-700'}>
                        {answer.answerText}
                      </span>
                      {answer.isCorrect && (
                        <span className="ml-auto text-green-600 text-sm">✓ Correct</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Summary Statistics (Dummy Data) */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Quiz Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-700">3</p>
              <p className="text-gray-600">Total Questions</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-700">18</p>
              <p className="text-gray-600">Total Points</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-700">5</p>
              <p className="text-gray-600">Average Difficulty</p>
            </div>
          </div>
        </div>
        
        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewQuizModal;