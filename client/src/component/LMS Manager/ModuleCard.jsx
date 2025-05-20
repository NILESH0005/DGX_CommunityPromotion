import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ApiContext from "../../context/ApiContext.jsx";
import ByteArrayImage from "../../utils/ByteArrayImage.jsx";
import { FiArrowRight } from "react-icons/fi";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white p-4 md:p-6 rounded-xl shadow-md cursor-pointer h-full">
            <div className="h-32 md:h-40 bg-gray-200 animate-pulse rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4 mb-3 mx-auto"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      {modules.map((module) => (
        <div
          key={module.ModuleID}
          className="bg-white p-4 md:p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 flex flex-col h-full"
          onClick={() => handleModuleClick(module.ModuleID)}
        >
          <div className="flex justify-center mb-3 md:mb-4 h-32 md:h-40 overflow-hidden rounded-lg group">
            {module.ModuleImage ? (
              <ByteArrayImage
                byteArray={module.ModuleImage.data}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center text-gray-400 text-sm h-full w-full bg-gray-100">
                No Image Available
              </div>
            )}
          </div>
          
          <h2 className="text-xl md:text-2xl font-semibold text-center mb-1 md:mb-2 text-DGXblue">
            {module.ModuleName}
          </h2>
          <p className="text-gray-600 text-base md:text-lg text-center flex-grow">
            {module.ModuleDescription || "No description available"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ModuleCard;