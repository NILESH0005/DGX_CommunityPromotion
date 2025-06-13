import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import ApiContext from "../../context/ApiContext";
import ByteArrayImage from "../../utils/ByteArrayImage";
import ProgressBar from "./ProgressBar";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import BreadCrumb from "./BreadCrumb";

const SubModuleCard = () => {
  const { moduleId } = useParams();
  const [searchParams] = useSearchParams();
  const [filteredSubModules, setFilteredSubModules] = useState([]);
  const [moduleName, setModuleName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchData, userToken } = useContext(ApiContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  useEffect(() => {
    const nameFromParams = searchParams.get('moduleName');
    if (nameFromParams) {
      setModuleName(decodeURIComponent(nameFromParams));
    } else if (location.state?.moduleName) {
      setModuleName(location.state.moduleName);
    }
  }, [location.state, searchParams]);

  useEffect(() => {
    const fetchAllSubModules = async () => {
      try {
        setLoading(true);
        setError(null);
        const subModulesResponse = await fetchData(
          `dropdown/getSubModules?moduleId=${moduleId}`,
          "GET"
        );
        if (!subModulesResponse?.success) {
          setError(subModulesResponse?.message || "Failed to fetch submodules");
          return;
        }
        const subModuleIds = subModulesResponse.data.map(sm => sm.SubModuleID);
        const progressResponse = await fetchData(
          'progressTrack/getSubModulesProgress',
          'POST',
          { moduleId, subModuleIds },
          {
            "Content-Type": "application/json",
            "auth-token": userToken
          }
        );
        const subModulesWithProgress = subModulesResponse.data.map(subModule => ({
          ...subModule,
          progress: progressResponse?.data?.find(p => p.subModuleID === subModule.SubModuleID)?.progressPercentage || 0
        }));

        setFilteredSubModules(subModulesWithProgress);

        // Step 4: Set module name and expanded state
        // const currentModule = subModulesResponse.data.find(
        //   module => module.ModuleID?.toString() === moduleId
        // );
        // setModuleName(currentModule?.ModuleName || "");

        const initialExpandedState = {};
        subModulesResponse.data.forEach(subModule => {
          initialExpandedState[subModule.SubModuleID] = false;
        });
        setExpandedDescriptions(initialExpandedState);
        if (!moduleName) {
          const currentModule = subModulesResponse.data[0]?.ModuleName;
          if (currentModule) {
            setModuleName(currentModule);
            // Update URL to include moduleName if it wasn't there
            if (!searchParams.get('moduleName')) {
              navigate(`?moduleName=${encodeURIComponent(currentModule)}`, { replace: true });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllSubModules();
  }, [moduleId, fetchData, userToken]);


  const toggleDescription = (subModuleId, event) => {
    event.stopPropagation();
    setExpandedDescriptions(prev => ({
      ...prev,
      [subModuleId]: !prev[subModuleId]
    }));
  };

  const handleSubModuleClick = (subModule) => {
    navigate(`/submodule/${subModule.SubModuleID}`, {
      state: {
        moduleId,
        moduleName,
        submoduleName: subModule.SubModuleName
      }
    });
  };

  const handleFileClick = (file, subModule) => {
    navigate('/file-viewer', {
      state: {
        fileUrl: file.url,
        fileName: file.name,
        moduleId: moduleId,
        moduleName: moduleName,
        submoduleId: subModule.SubModuleID,
        submoduleName: subModule.SubModuleName
      }
    });
  };

  const isDescriptionClamped = (description) => {
    return description && description.length > 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden h-[400px] flex flex-col">
                <div className="h-48 bg-gray-200 animate-pulse flex-shrink-0"></div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
                  <div className="h-16 bg-gray-200 rounded animate-pulse flex-grow"></div>
                  <div className="h-12 mt-4 flex items-center">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                  </div>
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
        {/* Simplified BreadCrumb - no need for customPaths since we're already on the module page */}
        <BreadCrumb />

        {/* Module Title Section */}
        {moduleName && (
          <div className="w-full text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {moduleName}
            </h1>
            <p className="text-gray-500 text-lg">
              Explore the learning modules under this section
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubModules.length > 0 ? (
            filteredSubModules.map((subModule) => (
              <div
                key={subModule.SubModuleID}
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${expandedDescriptions[subModule.SubModuleID]
                  ? 'h-auto'
                  : 'h-[400px]'
                  }`}
                onClick={() => handleSubModuleClick(subModule)}
              >
                <div className="h-40 bg-gray-100 overflow-hidden flex-shrink-0">
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
                  <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors duration-200 break-words">
                    {subModule.SubModuleName}
                  </h3>

                  <div className="overflow-hidden">
                    <p
                      className={`text-gray-600 text-base mb-1 hover:text-gray-800 transition-colors duration-200 break-words ${expandedDescriptions[subModule.SubModuleID]
                        ? 'overflow-y-auto max-h-32'
                        : 'line-clamp-3'
                        }`}
                    >
                      {subModule.SubModuleDescription || "No description available"}
                    </p>
                  </div>

                  {/* Read More Button */}
                  {isDescriptionClamped(subModule.SubModuleDescription) && (
                    <div className="h-8 mb-3 flex-shrink-0">
                      <button
                        onClick={(e) => toggleDescription(subModule.SubModuleID, e)}
                        className="text-blue-500 hover:text-blue-700 text-sm flex items-center bg-white hover:bg-blue-50 px-2 py-1 rounded-md shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200 hover:border-blue-300"
                      >
                        {expandedDescriptions[subModule.SubModuleID] ? (
                          <>
                            <FaAngleUp className="mr-1" />
                            <span className="font-medium">Show Less</span>
                          </>
                        ) : (
                          <>
                            <FaAngleDown className="mr-1" />
                            <span className="font-medium">Read More</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="mt-4">
                    <ProgressBar
                      subModuleID={subModule.SubModuleID}  // Pass the ID explicitly
                      initialProgress={subModule.progress || 0}  // Optional fallback
                    />
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