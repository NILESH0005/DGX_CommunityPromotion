import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ApiContext from "../../context/ApiContext";
import ByteArrayImage from "../../utils/ByteArrayImage";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

const ModuleCard = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchData } = useContext(ApiContext);
  const navigate = useNavigate();
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await fetchData("dropdown/getModules", "GET");
        if (response?.success) {
          setModules(response.data);
          const initialExpandedState = {};
          response.data.forEach(module => {
            initialExpandedState[module.ModuleID] = false;
          });
          setExpandedDescriptions(initialExpandedState);
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [fetchData]);

  const handleModuleClick = (moduleId, moduleName) => {
    navigate(`/module/${moduleId}?moduleName=${encodeURIComponent(moduleName)}`);
  };

  const toggleDescription = (moduleId, event) => {
    event.stopPropagation();
    setExpandedDescriptions(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const isDescriptionClamped = (description) => {
    if (!description) return false;
    return description.length > 100;
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <div
              key={module.ModuleID}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => handleModuleClick(module.ModuleID, module.ModuleName)}
            >
              <div className="h-48 bg-gray-100 overflow-hidden">
                {module.ModuleImage ? (
                  <ByteArrayImage
                    byteArray={module.ModuleImage.data}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center text-gray-400 text-sm h-full">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3
                  className="text-xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors duration-200 break-words"
                >
                  {module.ModuleName}
                </h3>

                <p
                  className={`text-gray-600 text-base mb-4 hover:text-gray-800 transition-colors duration-200 break-words ${expandedDescriptions[module.ModuleID]
                      ? 'overflow-y-auto max-h-32'
                      : 'line-clamp-2'
                    }`}
                >
                  {module.ModuleDescription || "No description available"}
                </p>

                {(isDescriptionClamped(module.ModuleDescription) && (
                  <button
                    onClick={(e) => toggleDescription(module.ModuleID, e)}
                    className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm flex items-center self-start"
                  >
                    {expandedDescriptions[module.ModuleID] ? (
                      <>
                        <FaAngleUp className="mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <FaAngleDown className="mr-1" />
                        Read More
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;