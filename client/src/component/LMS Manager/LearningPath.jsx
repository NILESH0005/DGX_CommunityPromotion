import React from 'react';
import ModuleCard from './ModuleCard';
import LeaderBoard from './LeaderBoard';

const LearningPath = ({ modules }) => {
  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">LMS Platform</h1>
        <p className="text-lg text-gray-600">Explore our interactive learning modules</p>
      </div>

      {/* Main Content Section */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Module Cards Grid */}
       <div className="p-4">
              <ModuleCard />
            </div>

        {/* Leaderboard Section */}
        <div className="w-full lg:w-[300px]">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 sticky top-6">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Top Learners</h2>
              <p className="text-sm text-gray-500">Top performers this week</p>
            </div>
            <div className="p-4">
              <LeaderBoard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
