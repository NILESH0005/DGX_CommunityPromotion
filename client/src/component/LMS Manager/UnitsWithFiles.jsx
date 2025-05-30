import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import ApiContext from '../../context/ApiContext';
import FileViewer from '../../utils/FileViewer';
import Swal from 'sweetalert2';


const UnitsWithFiles = () => {
  const { subModuleId } = useParams();
  const [allUnits, setAllUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchData, userToken } = useContext(ApiContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewedFiles, setViewedFiles] = useState(new Set());
  const [userFileIds, setUserFileIds] = useState([]); // New state for user's file IDs


  useEffect(() => {
    const fetchUserFileIds = async () => {
      try {
        if (!userToken) {
          console.log("No user token available, skipping file IDs fetch");
          return;
        }

        console.log("Current user token:", userToken); // Debug token

        const response = await fetchData(
          "progressTrack/getUserFileIDs",
          "POST",
          {},
          {
            'Content-Type': 'application/json',
            'auth-token': userToken
          }
        );

        console.log("File IDs response:", response);

        if (response?.success) {
          const fileIds = response.data.fileIds.map(file => file.FileID);
          setViewedFiles(new Set(fileIds));
          setUserFileIds(response.data.fileIds);
        } else {
          console.error("Failed to fetch user file IDs:", response?.message);
          // Swal.fire({
          //   icon: 'error',
          //   title: 'Error',
          //   text: response?.message || 'Failed to load progress data',
          //   timer: 2000
          // });
        }
      } catch (error) {
        console.error("Error fetching user's file IDs:", error);
        // Swal.fire({
        //   icon: 'error',
        //   title: 'Connection Error',
        //   text: 'Could not load your progress data',
        //   timer: 2000,
        //   showConfirmButton: false
        // });
      }
    };

    if (userToken) {
      fetchUserFileIds();
    }
  }, [userToken, fetchData]);
  useEffect(() => {
    console.log('subModuleId changed:', subModuleId, typeof subModuleId);

    const fetchUnitsWithFiles = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching units for subModuleId:', subModuleId);

        const response = await fetchData("dropdown/getUnitsWithFiles", "GET");
        console.log('API Response:', response);

        if (response?.success) {
          setAllUnits(response.data);

          const filtered = response.data.filter(unit => {
            return String(unit.SubModuleID) === String(subModuleId);
          });

          console.log('Filtered Units:', filtered);
          setFilteredUnits(filtered);
          if (filtered.length > 0 && filtered[0].files?.length > 0) {
            const firstFile = filtered[0].files[0];
            setSelectedFile({
              ...firstFile,
              unitName: filtered[0].UnitName,
              unitDescription: filtered[0].UnitDescription
            });
          }
        } else {
          setError('Failed to fetch units data');
        }
      } catch (error) {
        console.error("Error fetching units:", error);
        setError('An error occurred while fetching units');
      } finally {
        setLoading(false);
      }
    };

    if (subModuleId) {
      fetchUnitsWithFiles();
    } else {
      setLoading(false);
      setAllUnits([]);
      setFilteredUnits([]);
      setSelectedFile(null);
    }
  }, [subModuleId, fetchData]);


  const recordFileView = async (fileId, unitId) => {
    try {
      if (viewedFiles.has(fileId)) return;

      const response = await fetchData(
        "lmsEdit/recordFileView",
        "POST",
        {
          FileID: fileId,
          UnitID: unitId,
          SubModuleID: subModuleId,
        },
        {
          'Content-Type': 'application/json',
          'auth-token': userToken
        }
      );

      if (response?.success) {
        setViewedFiles(prev => new Set(prev).add(fileId));
      } else {
        console.error("Error recording file view:", response?.message || 'Unknown error');
      }
    } catch (error) {
      console.error("Error recording file view:", error.message || 'Unknown error');
    }
  };


  const handleFileSelect = (file, unit) => {
    setSelectedFile({
      ...file,
      unitName: unit.UnitName,
      unitDescription: unit.UnitDescription
    });

    // Record the file view
    recordFileView(file.FileID, unit.UnitID);
  };

  if (!subModuleId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">No Submodule Selected</h2>
          <p className="text-gray-600">
            Please select a submodule from the menu to view its units and files.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <div className="w-64 bg-gray-800 text-white p-4 border-r border-gray-700">
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-6 animate-pulse"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded mb-3 animate-pulse"></div>
          ))}
        </div>
        <div className="flex-1 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6 animate-pulse"></div>
          <div className="h-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (filteredUnits.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">No Units Found</h2>
          <p className="text-gray-600">
            There are no units available for the selected submodule.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Navigation Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4 border-r border-gray-700 overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">Units</h2>
        <div className="space-y-4">
          {filteredUnits.map(unit => (
            <div
              key={unit.UnitID}
              className="p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer border border-gray-700"
              onClick={() => {
                if (unit.files?.length > 0) {
                  setSelectedFile({
                    ...unit.files[0],
                    unitName: unit.UnitName,
                    unitDescription: unit.UnitDescription
                  });
                }
              }}
            >
              <h3 className="font-bold text-lg mb-1">{unit.UnitName}</h3>
              <p className="text-gray-300 text-sm">{unit.UnitDescription}</p>

              {unit.files?.length > 0 && (
                <div className="mt-2 ml-2 border-l border-gray-600 pl-2">
                  {unit.files.map(file => {
                    const isViewed = viewedFiles.has(file.FileID);
                    const isSelected = selectedFile?.FileID === file.FileID;

                    return (
                      <div
                        key={file.FileID}
                        className={`py-1 px-2 rounded text-sm flex items-center transition-colors ${isSelected
                            ? "bg-blue-600 text-white"
                            : isViewed
                              ? "bg-green-50 text-green-800 border border-green-200 hover:bg-green-100"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileSelect(file, unit);
                        }}
                      >
                        <span className="mr-2">
                          {file.fileType === "pdf" ? "📄" :
                            file.fileType === "ipynb" ? "📓" :
                              file.fileType === "docx" ? "📝" : "📁"}
                        </span>
                        <span className="truncate flex-grow">
                          {file.FilesName}
                          {isViewed && !isSelected && (
                            <span className="ml-2 text-xs text-green-600">(viewed)</span>
                          )}
                        </span>
                        {isViewed && (
                          <svg
                            className="ml-2 h-4 w-4 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {selectedFile?.unitName || "Select a Unit"}
          </h1>
          <p className="text-gray-600 mt-2">
            {selectedFile?.unitDescription || ""}
          </p>
          {selectedFile && (
            <h2 className="text-xl font-semibold text-gray-700 mt-4">
              {selectedFile.FilesName}
              {selectedFile.fileType === "ipynb" && (
                <span className="ml-2 text-sm px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                  Jupyter Notebook
                </span>
              )}
            </h2>
          )}
        </div>

        <div className={`flex-1 w-full rounded-xl shadow-lg relative overflow-hidden ${selectedFile?.fileType === "ipynb" ?
          "bg-[#f5f5f5] border border-gray-300" :
          "bg-white border"
          }`}>
          {selectedFile?.fileType === "ipynb" && (
            <div className="absolute top-0 left-0 right-0 h-8 bg-gray-200 flex items-center px-4 border-b border-gray-300 z-10">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="ml-4 text-sm text-gray-600 font-medium">
                {selectedFile.FilesName}
              </div>
            </div>
          )}
          <div className={selectedFile?.fileType === "ipynb" ? "h-full pt-8" : "h-full"}>
            <FileViewer
              fileUrl={`${import.meta.env.VITE_API_UPLOADSURL}${selectedFile?.FilePath}`}
              className="w-full h-full"
            />
          </div>
          {selectedFile?.fileType === "ipynb" && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-100 flex items-center px-4 border-t border-gray-300 text-xs text-gray-500">
              <span>Kernel: Python 3</span>
              <span className="mx-2">|</span>
              <span>Notebook</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

UnitsWithFiles.propTypes = {
  subModuleId: PropTypes.string.isRequired
};

export default UnitsWithFiles;