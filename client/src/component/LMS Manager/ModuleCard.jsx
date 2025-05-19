import React, { useState, useEffect, useContext } from "react";
import ApiContext from "../../context/ApiContext.jsx";
import SubModuleCard from "./SubModuleCard.jsx";

const ModuleCard = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchData } = useContext(ApiContext);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await fetchData("lms/getModules", "GET");
        if (response?.success) {
          setModules(response.data);
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content area */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {modules.map((module) => (
                <IndividualModuleCard key={module.ModuleID} module={module} />
              ))}
            </div>
          </div>
          
        
        </div>
      </div>
    </div>
  );
};

const IndividualModuleCard = ({ module }) => {
  const [expanded, setExpanded] = useState(false);
  const [subModules, setSubModules] = useState([]);
  const [loadingSubmodules, setLoadingSubmodules] = useState(false);
  const { fetchData } = useContext(ApiContext);

  const handleToggle = async () => {
    setExpanded(!expanded);

    if (!expanded && subModules.length === 0) {
      setLoadingSubmodules(true);
      try {
        const response = await fetchData(
          `lms/getSubModules?moduleId=${module.ModuleID}`,
          "GET"
        );
        if (response?.success) {
          setSubModules(response.data);
        }
      } catch (error) {
        console.error("Error fetching submodules:", error);
      } finally {
        setLoadingSubmodules(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="cursor-pointer" onClick={handleToggle}>
        <div className="h-48 overflow-hidden">
          {module.ModuleImage ? (
            <img
              src={`data:image/jpeg;base64,${module.ModuleImage}`}
              alt={module.ModuleName}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
              No Image Available
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="mb-2">
            <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
              {module.Category || "General"}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            {module.ModuleName}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {module.ModuleDescription || "No description available"}
          </p>
          <button
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              // Handle explore module click
            }}
          >
            Explore Module
          </button>
        </div>
      </div>

      {expanded && (
        <div className="bg-gray-50 p-4 border-t">
          {loadingSubmodules ? (
            <div className="text-center text-sm text-gray-500 py-4">
              Loading submodules...
            </div>
          ) : subModules.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 mt-2">
              {subModules.map((subModule) => (
                <SubModuleCard key={subModule.SubModuleID} submodule={subModule} />
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500 py-4">
              No submodules available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleCard;