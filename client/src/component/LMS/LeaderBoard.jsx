import React, { useState, useEffect } from "react";
import { Trophy, Crown, Award, ChevronDown, ChevronUp, Sparkles, Medal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const LeaderBoard = () => {
  const [expandedUser, setExpandedUser] = useState(null);
  const [topUsers, setTopUsers] = useState([]);
  const [otherUsers, setOtherUsers] = useState([]);


  const leaderboardData = [
    {
      id: 1,
      name: "Alex Johnson",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      points: 4850,
      progress: 92,
      badges: 8,
      streak: 14,
      completedModules: 24,
      rank: 1,
      recentActivity: [
        { module: "Generative AI", points: 150, date: "2 hours ago" },
        { module: "Computer Vision", points: 100, date: "1 day ago" }
      ]
    },
    {
      id: 2,
      name: "Sarah Williams",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      points: 4620,
      progress: 88,
      badges: 7,
      streak: 21,
      completedModules: 22,
      rank: 2,
      recentActivity: [
        { module: "Regression", points: 120, date: "5 hours ago" },
        { module: "Algorithms", points: 80, date: "2 days ago" }
      ]
    },
    {
      id: 3,
      name: "Michael Chen",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      points: 4380,
      progress: 83,
      badges: 6,
      streak: 7,
      completedModules: 20,
      rank: 3,
      recentActivity: [
        { module: "Object Classification", points: 200, date: "3 hours ago" },
        { module: "Data Sets", points: 50, date: "1 day ago" }
      ]
    },
    {
      id: 4,
      name: "Emily Rodriguez",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
      points: 4150,
      progress: 79,
      badges: 5,
      streak: 5,
      completedModules: 18,
      rank: 4,
      recentActivity: [
        { module: "Teaching Kits", points: 180, date: "8 hours ago" },
        { module: "Annotation", points: 70, date: "3 days ago" }
      ]
    },
    {
      id: 5,
      name: "David Kim",
      avatar: "https://randomuser.me/api/portraits/men/52.jpg",
      points: 3920,
      progress: 75,
      badges: 4,
      streak: 3,
      completedModules: 16,
      rank: 5,
      recentActivity: [
        { module: "Digital Learning", points: 90, date: "1 hour ago" },
        { module: "Pre-Trained Models", points: 110, date: "2 days ago" }
      ]
    },
    {
      id: 6,
      name: "Jessica Lee",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
      points: 3680,
      progress: 70,
      badges: 3,
      streak: 2,
      completedModules: 14,
      rank: 6,
      recentActivity: [
        { module: "Generative AI", points: 160, date: "4 hours ago" },
        { module: "Computer Vision", points: 60, date: "1 day ago" }
      ]
    },
    {
      id: 7,
      name: "Daniel Brown",
      avatar: "https://randomuser.me/api/portraits/men/41.jpg",
      points: 3450,
      progress: 66,
      badges: 2,
      streak: 1,
      completedModules: 12,
      rank: 7,
      recentActivity: [
        { module: "Regression", points: 140, date: "6 hours ago" },
        { module: "Algorithms", points: 40, date: "3 days ago" }
      ]
    }
  ];

  useEffect(() => {
    setTopUsers(leaderboardData.slice(0, 3));
    setOtherUsers(leaderboardData.slice(3).map((user, index) => ({
      ...user,
      rank: index + 4
    })));
  }, []);

  const toggleExpand = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const rankColors = {
    1: { 
      bg: "bg-gradient-to-b from-yellow-400 to-yellow-200",
      text: "text-yellow-800",
      border: "border-yellow-300",
      medal: "text-yellow-500",
      icon: <Medal className="w-6 h-6 absolute" />
    },
    2: { 
      bg: "bg-gradient-to-b from-gray-300 to-gray-100",
      text: "text-gray-700",
      border: "border-gray-200",
      medal: "text-gray-400",
      icon: <Medal className="w-6 h-6 absolute" />
    },
    3: { 
      bg: "bg-gradient-to-b from-amber-400 to-amber-200",
      text: "text-amber-800",
      border: "border-amber-300",
      medal: "text-amber-600",
      icon: <Medal className="w-6 h-6 absolute" />
    }
  };

  const podiumVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        type: "spring",
        damping: 10,
        stiffness: 100
      }
    }),
    hover: {
      y: -5,
      transition: { type: "spring", stiffness: 300 }
    }
  };

  const floatVariants = {
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-DGXblue to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Trophy className="w-8 h-8 mr-3" />
            <h2 className="text-2xl font-bold">Leaderboard</h2>
          </div>
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        </div>
        <p className="mt-2 opacity-90">Top performers this week</p>
      </div>

      {/* Top 3 in a Row with Medals */}
      <div className="px-6 py-4 bg-white">
        <div className="flex justify-center items-end space-x-4 h-48">
          {topUsers.map((user) => (
            <motion.div
              key={user.id}
              custom={user.rank}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              variants={podiumVariants}
              className={`flex flex-col items-center justify-end rounded-t-lg p-4 relative ${
                rankColors[user.rank].bg
              } ${user.rank === 1 ? "h-40 w-32" : user.rank === 2 ? "h-36 w-28" : "h-32 w-24"}`}
            >
              {/* Medal with rank number */}
              <motion.div 
                variants={floatVariants}
                animate="float"
                className={`absolute -top-3 flex items-center justify-center ${rankColors[user.rank].medal}`}
              >
                <div className="relative">
                  {rankColors[user.rank].icon}
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                    {user.rank}
                  </span>
                </div>
              </motion.div>
              
              {/* User avatar and info */}
              <motion.div
                className="flex flex-col items-center -mb-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 rounded-full border-4 border-white overflow-hidden shadow-lg mb-2"
                >
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </motion.div>
                <div className="text-center">
                  <h3 className={`text-sm font-bold ${rankColors[user.rank].text}`}>{user.name}</h3>
                  <p className="text-xs font-semibold text-white">{user.points} pts</p>
                </div>
              </motion.div>
              
              {/* Shining effect for 1st place */}
              {user.rank === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0], scale: [1, 1.2, 1] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3,
                    times: [0, 0.5, 1]
                  }}
                  className="absolute inset-0 rounded-t-lg bg-yellow-200 pointer-events-none"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Other Users List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {otherUsers.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm mb-3 overflow-hidden"
          >
            <div 
              className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => toggleExpand(user.id)}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-gray-200">
                <span className="text-sm font-bold text-gray-600">
                  {user.rank}
                </span>
              </div>

              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-DGXblue to-blue-400 h-2 rounded-full" 
                      style={{ width: `${user.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 ml-2">{user.points} pts</span>
                </div>
              </div>

              <div className="ml-2">
                {expandedUser === user.id ? (
                  <ChevronUp className="text-gray-400" />
                ) : (
                  <ChevronDown className="text-gray-400" />
                )}
              </div>
            </div>

            <AnimatePresence>
              {expandedUser === user.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 overflow-hidden"
                >
                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Badges</p>
                      <p className="font-bold text-DGXblue">{user.badges}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Streak</p>
                      <p className="font-bold text-DGXblue">{user.streak} days</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Modules</p>
                      <p className="font-bold text-DGXblue">{user.completedModules}</p>
                    </div>
                  </div>
                  
                  <div className="pb-3">
                    <h4 className="text-xs font-semibold text-gray-500 mb-2">RECENT ACTIVITY</h4>
                    <div className="space-y-2">
                      {user.recentActivity.map((activity, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="font-medium">{activity.module}</span>
                          <div className="flex items-center">
                            <span className="text-DGXblue font-semibold mr-2">+{activity.points}</span>
                            <span className="text-gray-400 text-xs">{activity.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Current User */}
      <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-DGXblue">
            <img 
              src="https://randomuser.me/api/portraits/women/22.jpg" 
              alt="You" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">You</h3>
            <div className="flex items-center mt-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-DGXblue to-blue-400 h-2 rounded-full" 
                  style={{ width: '65%' }}
                ></div>
              </div>
              <span className="text-xs font-medium text-gray-500 ml-2">2,850 pts</span>
            </div>
          </div>
          <div className="ml-2">
            <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">#12</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderBoard;