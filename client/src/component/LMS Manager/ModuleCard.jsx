import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ApiContext from "../../context/ApiContext.jsx";
import ByteArrayImage from "../../utils/ByteArrayImage.jsx";

const ModuleCard = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchData } = useContext(ApiContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await fetchData("dropdown/getModules", "GET");
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

  const handleModuleClick = (moduleId) => {
    navigate(`/module/${moduleId}`);
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
        {/* <h1 className="text-3xl font-bold text-gray-800 mb-8">Learning Modules</h1> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <div 
              key={module.ModuleID} 
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
              onClick={() => handleModuleClick(module.ModuleID)}
            >
              <div className="h-40 bg-gray-100 overflow-hidden">
                {module.ModuleImage ? (
                  <>
                  <span>{JSON.stringify(module.ModuleImage.data)}</span>
                  <ByteArrayImage byteArray={module.ModuleImage.data} />
                  </>
                ) : (
                  <div className="flex items-center justify-center text-gray-400 text-sm h-full">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-6">
                {/* <div className="mb-2">
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
                    {module.Category || "General"}
                  </span>
                </div> */}
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {module.ModuleName}
                </h3>
                <p className="text-gray-600 text-sm">
                  {module.ModuleDescription || "No description available"}
                </p>
                <div className="mt-4">
                  <button 
                    className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModuleClick(module.ModuleID);
                    }}
                  >
                    View Submodules
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;