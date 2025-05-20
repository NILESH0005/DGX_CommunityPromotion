import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiContext from '../../context/ApiContext';
import ByteArrayImage from '../../utils/ByteArrayImage';

const SubModuleCard = () => {
  const { moduleId } = useParams();
  const [filteredSubModules, setFilteredSubModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchData } = useContext(ApiContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllSubModules = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchData("dropdown/getSubModules", "GET");

        if (response?.success) {
          const filtered = response.data.filter(
            subModule => subModule.ModuleID?.toString() === moduleId
          );
          setFilteredSubModules(filtered);
          console.log('Filtered submodules:', filtered);
        } else {
          setError(response?.message || "Failed to fetch submodules");
        }
      } catch (error) {
        console.error("Error fetching submodules:", error);
        setError("An error occurred while fetching submodules");
      } finally {
        setLoading(false);
      }
    };

    fetchAllSubModules();
  }, [moduleId, fetchData]);
  console.log("Submodule: ", filteredSubModules);
  

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubModules.length > 0 ? (
            filteredSubModules.map((subModule) => (
              <div
                key={subModule.SubModuleID}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="h-40 bg-gray-100 overflow-hidden">
                  {subModule.SubModuleImage ? (
                    <>
                    <span>{JSON.stringify(subModule.SubModuleImage.data)}</span>
                    <ByteArrayImage
                      byteArray={subModule.SubModuleImage.data}
                      className="w-full h-full object-cover"
                    />
                    </>
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
                  <div className="mt-4">
                    <button
                      className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                      onClick={() => {
                        navigate(`/submodule/${subModule.SubModuleID}`);
                      }}
                    >
                      View Content
                    </button>
                  </div>
                </div>
              </div>
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