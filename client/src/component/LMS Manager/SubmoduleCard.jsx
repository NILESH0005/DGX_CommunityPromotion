import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiContext from "../../context/ApiContext.jsx";
import ByteArrayImage from "../../utils/ByteArrayImage.jsx";

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
        setLoading(false);
      }
    };

    fetchData();
  }, [moduleId, fetchData]);


  // const handleSubModuleClick = (subModuleId) => {
  //   navigate(`/module/${moduleId}/submodule/${subModuleId}/units`);
  // };

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log("Rendering with subModules:", subModules); // Debug log

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
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
            >
              Back to Modules
            </button>
          </div>
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
        )}
      </div>
    </div>
  );
};

export default SubModuleCard;