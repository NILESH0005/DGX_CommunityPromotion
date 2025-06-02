import React, { useEffect, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import ApiContext from '../../context/ApiContext';

const ProgressBar = ({ subModuleID, initialProgress = 0 }) => {
  const [animatedProgress, setAnimatedProgress] = useState(initialProgress);
  const { fetchData, userToken } = useContext(ApiContext);
  const [loading, setLoading] = useState(false); // Start as false if using initialProgress
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!subModuleID) {
      setError('No subModuleID provided');
      return;
    }

    const fetchProgress = async () => {
      try {
        setLoading(true);
        const result = await fetchData(
          'progressTrack/getSubModuleProgress', 
          'POST', 
          { subModuleID },
          {
            "Content-Type": "application/json",
            "auth-token": userToken
          }
        );
        
        if (result.success) {
          setAnimatedProgress(result.data.progressPercentage);
        } else {
          setError(result.message || 'Failed to fetch progress');
          setAnimatedProgress(initialProgress); // Fallback to initial
        }
      } catch (err) {
        setError(err.message || 'Something went wrong');
        setAnimatedProgress(initialProgress); // Fallback to initial
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [subModuleID, fetchData, userToken, initialProgress]);

  return (
    <div className="w-full mt-4">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>Progress</span>
        {loading ? (
          <span>...</span>
        ) : (
          <span>{animatedProgress}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-blue-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${loading ? initialProgress : animatedProgress}%` }}
          transition={{ duration: 0.8, type: 'spring', damping: 10 }}
        />
      </div>
      {error && (
        <div className="text-xs text-red-500 mt-1">{error}</div>
      )}
    </div>
  );
};

export default ProgressBar;