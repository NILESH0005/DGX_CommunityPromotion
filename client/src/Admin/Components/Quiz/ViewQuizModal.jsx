import React, { useState } from 'react';

const ViewQuizModal = ({ quiz, onClose, getCategoryName, getLevelName, formatDateTime }) => {
  // Dummy data for questions and answers - expanded to have multiple groups
  const dummyQuestions = [
    // Group 1
    {
      id: 1,
      questionText: "What is the capital of France?",
      questionType: "Multiple Choice",
      points: 5,
      negativePoints: 1,
      group: "Group A",
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
      negativePoints: 2,
      group: "Group A",
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
      negativePoints: 1,
      group: "Group A",
      answers: [
        { id: 1, answerText: "True", isCorrect: false },
        { id: 2, answerText: "False", isCorrect: true }
      ]
    },
    // Group 2
    {
      id: 4,
      questionText: "What is 2 + 2?",
      questionType: "Multiple Choice",
      points: 5,
      negativePoints: 1,
      group: "Group B",
      answers: [
        { id: 1, answerText: "3", isCorrect: false },
        { id: 2, answerText: "4", isCorrect: true },
        { id: 3, answerText: "5", isCorrect: false }
      ]
    },
    {
      id: 5,
      questionText: "Which of these are fruits? (Select all that apply)",
      questionType: "Multiple Select",
      points: 8,
      negativePoints: 2,
      group: "Group B",
      answers: [
        { id: 1, answerText: "Apple", isCorrect: true },
        { id: 2, answerText: "Carrot", isCorrect: false },
        { id: 3, answerText: "Banana", isCorrect: true },
        { id: 4, answerText: "Potato", isCorrect: false }
      ]
    },
    {
      id: 6,
      questionText: "Water boils at 100°C at sea level.",
      questionType: "True/False",
      points: 4,
      negativePoints: 1,
      group: "Group B",
      answers: [
        { id: 1, answerText: "True", isCorrect: true },
        { id: 2, answerText: "False", isCorrect: false }
      ]
    }
  ];

  // Calculate total marks and negative marks
  const totalQuestions = dummyQuestions.length;
  const totalMarks = dummyQuestions.reduce((sum, question) => sum + question.points, 0);
  const totalNegativeMarks = dummyQuestions.reduce((sum, question) => sum + question.negativePoints, 0);

  // Get all unique groups
  const allGroups = [...new Set(dummyQuestions.map(q => q.group))];
  const [selectedGroup, setSelectedGroup] = useState("All Groups");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter questions based on selected group
  const filteredQuestions = selectedGroup === "All Groups" 
    ? dummyQuestions 
    : dummyQuestions.filter(question => question.group === selectedGroup);

  // Group filtered questions by their group property
  const groupedQuestions = filteredQuestions.reduce((groups, question) => {
    const groupName = question.group;
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(question);
    return groups;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-lg p-8 w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        {/* Centered Quiz Name Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gray-50 p-4 rounded-lg shadow-sm">
            {quiz.QuizName || "Quiz Report"}
          </h2>
        </div>
        
        {/* Quiz Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-blue-200 text-blue-700">
              Basic Information
            </h3>
            <div className="space-y-4 text-lg">
              <p className="flex items-center">
                <span className="font-semibold text-gray-700 w-40">Category:</span>
                <span className="text-gray-900">{getCategoryName(quiz.QuizCategory) || "General Knowledge"}</span>
              </p>
              <p className="flex items-center">
                <span className="font-semibold text-gray-700 w-40">Level:</span>
                <span className="text-gray-900">{getLevelName(quiz.QuizLevel) || "Intermediate"}</span>
              </p>
              <p className="flex items-center">
                <span className="font-semibold text-gray-700 w-40">Duration:</span>
                <span className="text-gray-900">{quiz.QuizDuration || 30} mins</span>
              </p>
              <p className="flex items-center">
                <span className="font-semibold text-gray-700 w-40">Negative Marking:</span>
                <span className={`font-medium ${quiz.NegativeMarking ? 'text-red-600' : 'text-green-600'}`}>
                  {quiz.NegativeMarking ? "Yes" : "No"}
                </span>
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-blue-200 text-blue-700">
              Timing & Visibility
            </h3>
            <div className="space-y-4 text-lg">
              <p className="flex items-center">
                <span className="font-semibold text-gray-700 w-40">Start Date:</span>
                <span className="text-gray-900">{formatDateTime(quiz.StartDateAndTime) || "2023-11-15 09:00 AM"}</span>
              </p>
              <p className="flex items-center">
                <span className="font-semibold text-gray-700 w-40">End Date:</span>
                <span className="text-gray-900">{formatDateTime(quiz.EndDateTime) || "2023-11-15 10:30 AM"}</span>
              </p>
              <p className="flex items-center">
                <span className="font-semibold text-gray-700 w-40">Visibility:</span>
                <span className="text-gray-900">{quiz.QuizVisibility || "Public"}</span>
              </p>
              <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-gray-200">
                <span className="font-semibold text-lg bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  Total Questions: {totalQuestions}
                </span>
                <span className="font-semibold text-lg bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  Total Marks: {totalMarks}
                </span>
                <span className="font-semibold text-lg bg-red-100 text-red-800 px-3 py-1 rounded-full">
                  Negative Marks: -{totalNegativeMarks}
                </span>
              </div>
            </div>
          </div>
        </div>
      
        {/* Questions and Answers Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800">Questions & Answers</h3>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between px-4 py-2 text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {selectedGroup}
                <svg className="w-5 h-5 ml-2 -mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedGroup("All Groups");
                        setIsDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-lg ${selectedGroup === "All Groups" ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      All Groups
                    </button>
                    {allGroups.map(group => (
                      <button
                        key={group}
                        onClick={() => {
                          setSelectedGroup(group);
                          setIsDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-lg ${selectedGroup === group ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-8">
            {Object.entries(groupedQuestions).map(([groupName, questions], groupIndex) => (
              <div key={groupName} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                {/* Group Header */}
                <div className="bg-blue-100 px-6 py-3 border-b">
                  <h4 className="font-bold text-xl text-blue-800">{groupName}</h4>
                </div>
                
                {/* Questions in the group */}
                <div className="space-y-6 p-6">
                  {questions.map((question, qIndex) => (
                    <div key={question.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-xl">
                          <span className="text-gray-600">Q{groupIndex * 3 + qIndex + 1}: </span>
                          {question.questionText}
                        </h4>
                        <div className="flex flex-col items-end space-y-2">
                          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                            {question.points} points
                          </span>
                          {quiz.NegativeMarking && (
                            <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                              -{question.negativePoints} points
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-md text-gray-600 mb-4">Type: {question.questionType}</p>
                      
                      <div className="ml-4 space-y-3">
                        {question.answers.map((answer) => (
                          <div 
                            key={answer.id} 
                            className={`flex items-center p-3 rounded-lg ${answer.isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-white border border-gray-200'}`}
                          >
                            <input 
                              type={question.questionType === "Multiple Select" ? "checkbox" : "radio"} 
                              checked={answer.isCorrect}
                              readOnly
                              className={`mr-3 w-5 h-5 ${answer.isCorrect ? 'accent-green-600' : 'accent-gray-400'}`}
                            />
                            <span className={`text-lg ${answer.isCorrect ? 'font-semibold text-green-800' : 'text-gray-700'}`}>
                              {answer.answerText}
                            </span>
                            {answer.isCorrect && (
                              <span className="ml-auto text-green-600 font-medium text-lg">✓ Correct Answer</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Close Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors text-lg font-semibold shadow-md"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewQuizModal;