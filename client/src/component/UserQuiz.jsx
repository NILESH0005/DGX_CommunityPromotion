import React, { useState, useEffect } from 'react';

// Sample quiz data
const generateQuizData = () => {
  const categories = ['JavaScript', 'React', 'CSS', 'HTML', 'Algorithms', 'Data Structures'];
  const quizData = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90); // Last 90 days
  
  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    // Random number of quizzes per day (0-3)
    const quizzesPerDay = Math.floor(Math.random() * 4);
    
    for (let j = 0; j < quizzesPerDay; j++) {
      const score = Math.floor(Math.random() * 41) + 60; // Scores between 60-100
      const timeSpent = Math.floor(Math.random() * 20) + 5; // 5-25 minutes
      const category = categories[Math.floor(Math.random() * categories.length)];
      const isCompleted = Math.random() > 0.2; // 80% completion rate
      
      quizData.push({
        id: `quiz-${i}-${j}`,
        date: date.toISOString().split('T')[0],
        score,
        timeSpent,
        category,
        isCompleted,
        title: `${category} Quiz ${j + 1}`,
        attempts: Math.floor(Math.random() * 3) + 1,
      });
    }
  }
  
  // Ensure some quizzes have multiple attempts for retake insights
  for (let i = 0; i < 10; i++) {
    const baseQuiz = quizData[Math.floor(Math.random() * quizData.length)];
    for (let j = 1; j <= 3; j++) {
      quizData.push({
        ...baseQuiz,
        id: `${baseQuiz.id}-retake-${j}`,
        date: new Date(new Date(baseQuiz.date).getTime() + j * 86400000).toISOString().split('T')[0],
        score: Math.min(100, baseQuiz.score + Math.floor(Math.random() * 15)),
        timeSpent: baseQuiz.timeSpent - Math.floor(Math.random() * 5),
        attempts: j + 1,
      });
    }
  }
  
  return quizData;
};

// Simple icon components to replace Heroicons
const TrophyIcon = () => <span>🏆</span>;
const ClockIcon = () => <span>⏱️</span>;
const ChartBarIcon = () => <span>📊</span>;
const CalendarIcon = () => <span>📅</span>;
const FilterIcon = () => <span>🔍</span>;
const ArrowTrendingUpIcon = () => <span>📈</span>;
const CheckCircleIcon = () => <span>✓</span>;
const XCircleIcon = () => <span>✗</span>;
const SparklesIcon = () => <span>✨</span>;

// Placeholder for charts
const ChartPlaceholder = ({ title, height = 300 }) => (
  <div style={{ height: `${height}px`, border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <p>{title} Chart (install Highcharts to view)</p>
  </div>
);

const UserQuiz = () => {
  const [quizData, setQuizData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    category: 'all',
    scoreRange: [0, 100],
  });
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Simulate data loading
    setLoading(true);
    setTimeout(() => {
      const data = generateQuizData();
      setQuizData(data);
      setFilteredData(data);
      setLoading(false);
      setAnimate(true);
      
      // Reset animation after it completes
      setTimeout(() => setAnimate(false), 1000);
    }, 800);
  }, []);

  useEffect(() => {
    // Apply filters
    let result = [...quizData];
    
    // Date range filter
    if (filters.dateRange !== 'all') {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      result = result.filter(quiz => new Date(quiz.date) >= cutoffDate);
    }
    
    // Category filter
    if (filters.category !== 'all') {
      result = result.filter(quiz => quiz.category === filters.category);
    }
    
    // Score range filter
    result = result.filter(quiz => 
      quiz.score >= filters.scoreRange[0] && 
      quiz.score <= filters.scoreRange[1]
    );
    
    setFilteredData(result);
  }, [filters, quizData]);

  const getStats = () => {
    if (filteredData.length === 0) return {};
    
    const scores = filteredData.map(q => q.score);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const average = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
    
    const completed = filteredData.filter(q => q.isCompleted).length;
    const started = filteredData.length;
    const completionRate = ((completed / started) * 100).toFixed(0);
    
    // Calculate streaks
    let currentStreak = 0;
    let maxStreak = 0;
    let lastDate = null;
    
    const uniqueDays = [...new Set(filteredData.map(q => q.date))].sort();
    
    uniqueDays.forEach(day => {
      if (!lastDate || new Date(day).getTime() === new Date(lastDate).getTime() + 86400000) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
      
      lastDate = day;
    });
    
    // Time spent stats
    const totalTime = filteredData.reduce((sum, q) => sum + q.timeSpent, 0);
    const avgTime = (totalTime / filteredData.length).toFixed(1);
    
    // Category distribution
    const categoryCount = filteredData.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {});
    
    const mostFrequentCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
    
    return {
      highest,
      lowest,
      average,
      completionRate,
      currentStreak,
      maxStreak,
      totalTime,
      avgTime,
      mostFrequentCategory,
      startDate: filteredData.length > 0 
        ? new Date(filteredData[filteredData.length - 1].date).toLocaleDateString() 
        : 'N/A',
      endDate: filteredData.length > 0 
        ? new Date(filteredData[0].date).toLocaleDateString() 
        : 'N/A',
    };
  };

  const stats = getStats();

  // Prepare data for retake insights
  const prepareRetakeData = () => {
    const retakeMap = {};
    
    filteredData.forEach(quiz => {
      const baseId = quiz.id.split('-retake-')[0];
      if (!retakeMap[baseId]) {
        retakeMap[baseId] = [];
      }
      retakeMap[baseId].push(quiz);
    });
    
    return Object.values(retakeMap)
      .filter(quizzes => quizzes.length > 1)
      .map(quizzes => ({
        title: quizzes[0].title,
        attempts: quizzes.map(q => ({
          attempt: q.attempts,
          score: q.score,
          date: q.date,
        })),
      }));
  };

  // Get unique categories
  const categories = [...new Set(quizData.map(q => q.category))];

  // Get achievements
  const getAchievements = () => {
    const achievements = [];
    const stats = getStats();
    
    if (stats.maxStreak >= 7) {
      achievements.push({
        name: '7-Day Streak',
        description: `Completed quizzes for ${stats.maxStreak} consecutive days`,
        icon: '🔥',
        color: 'bg-red-100 text-red-800',
      });
    }
    
    if (filteredData.length >= 20) {
      achievements.push({
        name: 'Quiz Enthusiast',
        description: `Completed ${filteredData.length} quizzes`,
        icon: '🏆',
        color: 'bg-yellow-100 text-yellow-800',
      });
    }
    
    if (stats.average >= 90) {
      achievements.push({
        name: 'High Scorer',
        description: `Average score of ${stats.average}%`,
        icon: '⭐',
        color: 'bg-blue-100 text-blue-800',
      });
    }
    
    if (stats.completionRate >= 90) {
      achievements.push({
        name: 'Completionist',
        description: `${stats.completionRate}% completion rate`,
        icon: '✅',
        color: 'bg-green-100 text-green-800',
      });
    }
    
    return achievements;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Welcome animation */}
      {animate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl animate-bounce">
            <SparklesIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-center">Welcome to Your Quiz Dashboard!</h2>
          </div>
        </div>
      )}
      
      <div className={`max-w-7xl mx-auto transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <TrophyIcon className="h-8 w-8 text-yellow-500 mr-2" />
          Quiz Performance Dashboard
        </h1>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <FilterIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="font-medium text-gray-700">Filters</h3>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                >
                  <option value="all">All Time</option>
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="block w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={filters.scoreRange[0]}
                    onChange={(e) => setFilters({
                      ...filters, 
                      scoreRange: [parseInt(e.target.value), filters.scoreRange[1]]
                    })}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="block w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={filters.scoreRange[1]}
                    onChange={(e) => setFilters({
                      ...filters, 
                      scoreRange: [filters.scoreRange[0], parseInt(e.target.value)]
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="font-medium text-gray-700">Activity Period</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {stats.startDate} - {stats.endDate}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {filteredData.length} quizzes attempted
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <ChartBarIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="font-medium text-gray-700">Score Overview</h3>
            </div>
            <div className="flex justify-between mt-2">
              <div>
                <p className="text-sm text-gray-500">Highest</p>
                <p className="text-2xl font-bold text-green-600">{stats.highest}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lowest</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowest}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Average</p>
                <p className="text-2xl font-bold text-blue-600">{stats.average}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="font-medium text-gray-700">Time Spent</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {stats.totalTime} min
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Avg. {stats.avgTime} min per quiz
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="font-medium text-gray-700">Completion Rate</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {stats.completionRate}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className="bg-green-500 h-2.5 rounded-full" 
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {filteredData.filter(q => q.isCompleted).length} completed of {filteredData.length} started
            </p>
          </div>
        </div>
         {/* Quiz List */}
         <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-lg mb-4">Recent Quiz Attempts</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.slice(0, 10).map((quiz, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(quiz.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {quiz.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quiz.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${quiz.score >= 90 ? 'bg-green-100 text-green-800' : 
                          quiz.score >= 70 ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {quiz.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quiz.timeSpent} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quiz.isCompleted ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-4 w-4 mr-1" /> Completed
                        </span>
                      ) : (
                        <span className="flex items-center text-yellow-600">
                          <XCircleIcon className="h-4 w-4 mr-1" /> Incomplete
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <ChartPlaceholder title="Quiz Activity Heatmap" height={200} />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <ChartPlaceholder title="Quiz Categories" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <ChartPlaceholder title="Quiz Performance Over Time" />
        </div>
        
        {/* Retake Insights */}
        {prepareRetakeData().length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 mr-2" />
              Retake Insights
            </h3>
            <div className="space-y-4">
              {prepareRetakeData().map((quiz, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <h4 className="font-medium">{quiz.title}</h4>
                  <div className="flex items-center mt-2 space-x-4 overflow-x-auto py-2">
                    {quiz.attempts.map((attempt, idx) => (
                      <div key={idx} className="flex flex-col items-center min-w-[80px]">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center 
                          ${idx === 0 ? 'bg-blue-100 text-blue-800' : 
                            attempt.score > quiz.attempts[idx-1].score ? 'bg-green-100 text-green-800' : 
                            attempt.score < quiz.attempts[idx-1].score ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          <span className="font-bold">{attempt.score}%</span>
                        </div>
                        <span className="text-xs mt-1">Attempt {attempt.attempt}</span>
                        <span className="text-xs text-gray-500">{new Date(attempt.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Achievements */}
        {getAchievements().length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <SparklesIcon className="h-5 w-5 text-yellow-500 mr-2" />
              Achievements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {getAchievements().map((achievement, index) => (
                <div 
                  key={index} 
                  className={`rounded-lg p-4 flex items-start ${achievement.color}`}
                >
                  <span className="text-2xl mr-3">{achievement.icon}</span>
                  <div>
                    <h4 className="font-bold">{achievement.name}</h4>
                    <p className="text-sm">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
       
      </div>
    </div>
  );
};

export default UserQuiz;