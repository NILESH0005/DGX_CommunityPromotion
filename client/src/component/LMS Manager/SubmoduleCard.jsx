import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiContext from "../../context/ApiContext.jsx";
import ByteArrayImage from "../../utils/ByteArrayImage.jsx";
<<<<<<< HEAD
import { motion } from "framer-motion";

const SubModuleCard = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [moduleData, setModuleData] = useState(null);
  const [subModules, setSubModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchData } = useContext(ApiContext);

  useEffect(() => {
    const fetchModuleAndSubmodules = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch module details
        const moduleResponse = await fetchData(`dropdown/getModuleById?moduleId=${moduleId}`, "GET");
        
        if (!moduleResponse?.success) {
          throw new Error("Failed to fetch module details");
        }
        
        setModuleData(moduleResponse.data);

        // 2. Fetch submodules
        const submoduleResponse = await fetchData(`lms/getSubModules?moduleId=${moduleId}`, "GET");
        
        if (!submoduleResponse?.success) {
          throw new Error("Failed to fetch submodules");
        }
        
        setSubModules(submoduleResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
=======

const SubModuleCard = () => {
  const { moduleId } = useParams();
  const [subModules, setSubModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleDetails, setModuleDetails] = useState(null);
  const [error, setError] = useState(null);
  const { fetchData } = useContext(ApiContext);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Module ID from URL:", moduleId); // Debug

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch module details
        const moduleResponse = await fetchData(
          `dropdown/getModuleById/${ModuleID}`,
          "GET"
        );
        console.log("Module details response:", moduleResponse);

        if (moduleResponse?.success) {
          setModuleDetails(moduleResponse.data[0]);
        } else {
          console.warn("Module details not found");
        }

        // Fetch submodules
        const subModuleResponse = await fetchData(
          `dropdown/getSubModules/${ModuleID}`,
          "GET"
        );
        console.log("Submodules response:", subModuleResponse);

        if (subModuleResponse?.success) {
          setSubModules(subModuleResponse.data);
        } else {
          console.warn("No submodules found");
          setSubModules([]); // Explicitly set empty array
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError("Failed to load data");
      } finally {
>>>>>>> c68a157debeca6d590effe5b86fb7c12f88d2bcd
        setLoading(false);
      }
    };

<<<<<<< HEAD
    fetchModuleAndSubmodules();
  }, [moduleId, fetchData]);

  const handleSubmoduleClick = (submoduleId) => {
    navigate(`/submodule/${submoduleId}`);
  };
=======
    fetchData();
  }, [moduleId, fetchData]);


  // const handleSubModuleClick = (subModuleId) => {
  //   navigate(`/module/${moduleId}/submodule/${subModuleId}/units`);
  // };
>>>>>>> c68a157debeca6d590effe5b86fb7c12f88d2bcd

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
<<<<<<< HEAD
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 h-64">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6 mb-6"></div>
                  <div className="h-10 bg-gray-200 rounded w-full mt-8"></div>
                </div>
              ))}
            </div>
=======
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
                  <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="mt-4 h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
>>>>>>> c68a157debeca6d590effe5b86fb7c12f88d2bcd
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
<<<<<<< HEAD
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="text-red-500 text-xl mb-4">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
=======
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
>>>>>>> c68a157debeca6d590effe5b86fb7c12f88d2bcd
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  if (!moduleData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-500 text-xl">Module not found</div>
      </div>
    );
  }
=======
  console.log("Rendering with subModules:", subModules); // Debug log
>>>>>>> c68a157debeca6d590effe5b86fb7c12f88d2bcd

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
<<<<<<< HEAD
        {/* Module Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {moduleData.ModuleName}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {moduleData.ModuleDescription || "Explore the submodules below"}
          </p>
          <div className="w-24 h-1 bg-blue-500 mx-auto mt-4"></div>
        </div>

        {/* Module Image (if available) */}
        {moduleData.ModuleImage && (
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-2xl h-64 rounded-lg overflow-hidden shadow-md">
              <ByteArrayImage 
                byteArray={moduleData.ModuleImage.data} 
                alt={moduleData.ModuleName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Submodules Grid */}
        {subModules.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subModules.map((submodule) => (
              <motion.div
                key={submodule.SubModuleID}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => handleSubmoduleClick(submodule.SubModuleID)}
              >
                <div className="p-6 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {submodule.SubModuleName}
                    </h2>
                  </div>
                  <p className="text-gray-600 mb-4 flex-grow">
                    {submodule.SubModuleDescription || "No description available"}
                  </p>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-sm text-gray-500">
                      {submodule.DurationMinutes || 0} min
                    </span>
                    <button 
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubmoduleClick(submodule.SubModuleID);
                      }}
                    >
                      Start
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No submodules available for this module
            </div>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
=======
        {moduleDetails && (
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              ← Back to Modules
            </button>
            <h1 className="text-3xl font-bold text-gray-800">{moduleDetails.ModuleName}</h1>
            <p className="text-gray-600 mt-2">{moduleDetails.ModuleDescription}</p>
          </div>
        )}

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Submodules</h2>

        {subModules.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No submodules found for this module</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => navigate(-1)}
>>>>>>> c68a157debeca6d590effe5b86fb7c12f88d2bcd
            >
              Back to Modules
            </button>
          </div>
<<<<<<< HEAD
=======
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subModules.map((subModule) => (
              <div
                key={subModule.SubModuleID}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
                onClick={() => handleSubModuleClick(subModule.SubModuleID)}
              >
                <div className="h-40 bg-gray-100 overflow-hidden">
                  {subModule.SubModuleImage ? (
                    // Try different ways to access the image data
                    typeof subModule.SubModuleImage === 'string' ? (
                      <img
                        src={subModule.SubModuleImage}
                        alt={subModule.SubModuleName}
                        className="w-full h-full object-cover"
                      />
                    ) : subModule.SubModuleImage.data ? (
                      <ByteArrayImage byteArray={subModule.SubModuleImage.data} />
                    ) : (
                      <ByteArrayImage byteArray={subModule.SubModuleImage} />
                    )
                  ) : (
                    <div className="flex items-center justify-center text-gray-400 text-sm h-full">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {subModule.SubModuleName || "Untitled Submodule"}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {subModule.SubModuleDescription || "No description available"}
                  </p>
                  <div className="mt-4">
                    <button
                      className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubModuleClick(subModule.SubModuleID);
                      }}
                    >
                      View Units
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
>>>>>>> c68a157debeca6d590effe5b86fb7c12f88d2bcd
        )}
      </div>
    </div>
  );
};

export default SubModuleCard;