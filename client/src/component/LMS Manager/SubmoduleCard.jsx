import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiContext from "../../context/ApiContext";
import ByteArrayImage from "../../utils/ByteArrayImage";
import ProgressBar from "./ProgressBar";

const SubModuleCard = () => {
  const { moduleId } = useParams();
  const [filteredSubModules, setFilteredSubModules] = useState([]);
  const [moduleName, setModuleName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchData } = useContext(ApiContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllSubModules = async () => {
      try {
        setLoading(true);
        setError(null);
        const [subModulesResponse, modulesResponse] = await Promise.all([
          fetchData("dropdown/getSubModules", "GET"),
          fetchData("dropdown/getModules", "GET"),
        ]);

        if (subModulesResponse?.success && modulesResponse?.success) {
          const filtered = subModulesResponse.data.filter(
            (subModule) => subModule.ModuleID?.toString() === moduleId
          );
          setFilteredSubModules(filtered);

          const currentModule = modulesResponse.data.find(
            (module) => module.ModuleID?.toString() === moduleId
          );
          setModuleName(currentModule?.ModuleName || "");
        } else {
          setError(
            subModulesResponse?.message ||
              modulesResponse?.message ||
              "Failed to fetch data"
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllSubModules();
  }, [moduleId, fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
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
        {moduleName && (
          <div className="w-full text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-800">
              {moduleName}
            </h2>
            <p className="text-gray-500 mt-2 text-lg">
              Explore the learning modules under this section
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubModules.length > 0 ? (
            filteredSubModules.map((subModule) => (
              <div
                key={subModule.SubModuleID}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/submodule/${subModule.SubModuleID}`)}
              >
                <div className="h-40 bg-gray-100 overflow-hidden">
                  {subModule.SubModuleImage ? (
                    <ByteArrayImage
                      byteArray={subModule.SubModuleImage.data}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-gray-400 text-sm h-full">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors duration-200">
                    {subModule.SubModuleName}
                  </h3>
                  <p className="text-gray-600 text-base mb-4 line-clamp-2 hover:text-gray-800 transition-colors duration-200">
                    {subModule.SubModuleDescription ||
                      "No description available"}
                  </p>
                  <div className="mt-4">
                    <ProgressBar progress={subModule.progress || 20} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-xl shadow-lg p-6 text-center">
              <p className="text-gray-600">
                No submodules found for this module
              </p>
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