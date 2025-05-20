import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApiContext from '../../context/ApiContext';
import ByteArrayImage from '../../utils/ByteArrayImage';

const SubModuleCard = () => {
  const { moduleId } = useParams();
  const [filteredSubModules, setFilteredSubModules] = useState([]);
  const [moduleInfo, setModuleInfo] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchData } = useContext(ApiContext);
  const navigate = useNavigate();
  const [userProgress, setUserProgress] = useState({});

  // Dynamic progress bar component (maintains same dimensions as Teaching Modules)
  const DynamicProgressBar = ({ progress }) => {
    const [animatedProgress, setAnimatedProgress] = useState(0);

    useEffect(() => {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 300);
      
      return () => clearTimeout(timer);
    }, [progress]);

    return (
      <div className="w-full mt-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{animatedProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${animatedProgress}%` }}
            transition={{ duration: 0.8, type: 'spring', damping: 10 }}
          />
        </div>
      </div>
    );
  };

  // Fetch user progress data
  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const userId = localStorage.getItem('userId') || '123';
        const progressResponse = await fetchData(`progress/getUserProgress/${userId}`, "GET");
        
        if (progressResponse?.success) {
          setUserProgress(progressResponse.data);
        }
      } catch (error) {
        console.error("Error fetching user progress:", error);
      }
    };

    fetchUserProgress();
  }, [fetchData]);

  // Calculate progress for a submodule
  const calculateSubModuleProgress = (subModuleId, allUnits) => {
    if (!userProgress.completedUnits || !allUnits) return 0;
    
    const completedUnitsInSubModule = allUnits.filter(unit => 
      unit.SubModuleID === subModuleId && 
      userProgress.completedUnits.includes(unit.UnitID)
    ).length;
    
    const totalUnitsInSubModule = allUnits.filter(unit => 
      unit.SubModuleID === subModuleId
    ).length;
    
    return totalUnitsInSubModule > 0 
      ? Math.round((completedUnitsInSubModule / totalUnitsInSubModule) * 100)
      : 0;
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch module info (title and description)
        const moduleResponse = await fetchData(`modules/getModuleById/${moduleId}`, "GET");
        if (moduleResponse?.success) {
          setModuleInfo({
            title: moduleResponse.data.ModuleName,
            description: moduleResponse.data.ModuleDescription
          });
        }

        // Fetch submodules and units in parallel
        const [subModuleResponse, unitsResponse] = await Promise.all([
          fetchData("dropdown/getSubModules", "GET"),
          fetchData("units/getAllUnits", "GET")
        ]);

        if (subModuleResponse?.success) {
          const filtered = subModuleResponse.data
            .filter(subModule => subModule.ModuleID?.toString() === moduleId)
            .map(subModule => ({
              ...subModule,
              progress: calculateSubModuleProgress(
                subModule.SubModuleID,
                unitsResponse?.success ? unitsResponse.data : []
              )
            }));
          
          setFilteredSubModules(filtered);
        } else {
          setError(subModuleResponse?.message || "Failed to fetch submodules");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [moduleId, fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-40 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
                  <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="mt-4 h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-300"
            >
              Back to Modules
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Module Title and Description */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-2">{moduleInfo.title || 'Module'}</h1>
          <p className="text-gray-600">{moduleInfo.description || 'No description available'}</p>
        </div>

        {/* Submodule Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubModules.length > 0 ? (
            filteredSubModules.map((subModule) => (
              <motion.div
                key={subModule.SubModuleID}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="h-40 bg-gray-100 overflow-hidden">
                  {subModule.SubModuleImage ? (
                    <ByteArrayImage
                      byteArray={subModule.SubModuleImage.data}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-gray-400 text-sm h-full">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {subModule.SubModuleName}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {subModule.SubModuleDescription || "No description available"}
                  </p>
                  
                  <DynamicProgressBar progress={subModule.progress} />
                  
                  <button
                    className="w-full mt-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                    onClick={() => navigate(`/submodule/${subModule.SubModuleID}`)}
                  >
                    View Content
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-xl shadow-lg p-6 text-center">
              <p className="text-gray-600">No submodules found for this module</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-300"
              >
                Back to Modules
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubModuleCard;