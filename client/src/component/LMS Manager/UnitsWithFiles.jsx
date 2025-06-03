import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import ApiContext from '../../context/ApiContext';
import FileViewer from '../../utils/FileViewer';
import Quiz from '../quiz/Quiz'
import Swal from 'sweetalert2';

const UnitsWithFiles = () => {
  const { subModuleId } = useParams();
  const [allUnits, setAllUnits] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchData, userToken } = useContext(ApiContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [viewedFiles, setViewedFiles] = useState(new Set());
  const [userFileIds, setUserFileIds] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
        }
      } catch (error) {
        console.error("Error fetching user's file IDs:", error);
      }
    };

    if (userToken) {
      fetchUserFileIds();
    }
  }, [userToken, fetchData]);

  useEffect(() => {
    const fetchDataForSubmodule = async () => {
      try {
        setLoading(true);
        setError(null);
        const unitsResponse = await fetchData(`dropdown/getUnitsWithFiles/${subModuleId}`, "GET");

        const quizzesResponse = await fetchData(
          "quiz/getQuizzesByRefId",
          "POST",
          { refId: subModuleId },
          {
            'Content-Type': 'application/json',
            'auth-token': userToken
          }
        );

        console.log("reessspoonnseee", quizzesResponse)

        if (unitsResponse?.success) {
          setAllUnits(unitsResponse.data);
          const filtered = unitsResponse.data.filter(unit => {
            return String(unit.SubModuleID) === String(subModuleId);
          });
          setFilteredUnits(filtered);
        }

        if (quizzesResponse?.success) {
          const transformedQuizzes = quizzesResponse.data.map(quiz => ({
            ...quiz,
            group_id: quiz.QuizGroupID
          }));
          setQuizzes(transformedQuizzes);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    if (subModuleId) {
      fetchDataForSubmodule();
    }
  }, [subModuleId, fetchData, userToken]);


  const recordFileView = async (fileId, unitId) => {
    try {
      // Check if THIS USER has already viewed THIS FILE
      if (viewedFiles.has(fileId)) {
        console.log("File already viewed by this user");
        return;
      }

      const response = await fetchData(
        "lmsEdit/recordFileView",
        "POST",
        { FileID: fileId },
        {
          'Content-Type': 'application/json',
          'auth-token': userToken
        }
      );

      if (response?.success) {
        if (response.message !== "File view already recorded for this user") {
          setViewedFiles(prev => new Set(prev).add(fileId));
        }
      } else {
        console.error("Error recording file view:", response?.message || 'Unknown error');
      }
    } catch (error) {
      console.error("Error recording file view:", error.message || 'Unknown error');
    }
  };

  const handleFileSelect = (file, unit) => {
    setSelectedQuiz(null); // Clear any selected quiz
    setSelectedFile({
      ...file,
      unitName: unit.UnitName,
      unitDescription: unit.UnitDescription
    });
    recordFileView(file.FileID, unit.UnitID);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "pdf":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case "ipynb":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" />
            <path d="M6 8h2v4H6zM10 8h2v4h-2zM14 10h-2v2h2z" />
          </svg>
        );
      case "docx":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const removeFileExtension = (filename) => {
    return filename.replace(/\.[^/.]+$/, "");
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

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setSelectedFile(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-[#1f2937] text-white p-4 border-r border-gray-700 transition-all duration-300`}>
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
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-[#1f2937] text-white border-r border-gray-700 overflow-y-auto transition-all duration-300 ease-in-out relative`}>
        {/* Toggle Button - Made Bigger and More Visible */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-6 top-8 bg-[#1f2937] text-white rounded-full p-4 border-2 border-gray-500 hover:bg-gray-600 hover:border-gray-400 transition-all duration-200 z-10 shadow-xl hover:shadow-2xl transform hover:scale-105"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <svg
            className={`w-6 h-6 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="p-4">
          {quizzes.length > 0 && (
            <div className="mb-6">
              <h3 className={`font-bold ${isSidebarCollapsed ? 'text-center' : 'text-lg mb-2'}`}>
                {isSidebarCollapsed ? 'Q' : 'Quizzes'}
              </h3>
              <div className="space-y-2">
                {quizzes.map(quiz => (
                  <div
                    key={quiz.QuizID}
                    className={`${isSidebarCollapsed ? 'p-2 flex justify-center' : 'p-2'} rounded hover:bg-gray-700 cursor-pointer ${selectedQuiz?.QuizID === quiz.QuizID ? 'bg-blue-600' : ''}`}
                    onClick={() => handleQuizSelect(quiz)}
                    title={isSidebarCollapsed ? quiz.QuizName : ''}
                  >
                    {isSidebarCollapsed ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div>
                        <h4 className="font-medium">{quiz.QuizName}</h4>
                        <p className="text-xs text-gray-300">
                          {quiz.QuizDuration} min • {quiz.PassingPercentage}% to pass
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Units List */}
          <div className="space-y-4">
            {filteredUnits.map(unit => (
              <div
                key={unit.UnitID}
                className={`${isSidebarCollapsed ? 'p-2' : 'p-3'} rounded-lg hover:bg-gray-700 transition-colors cursor-pointer border border-gray-700`}
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
                {isSidebarCollapsed ? (
                  <div className="flex justify-center" title={unit.UnitName}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-lg mb-1">{unit.UnitName}</h3>
                    <p className="text-gray-300 text-sm">{unit.UnitDescription}</p>
                  </>
                )}

                {unit.files?.length > 0 && (
                  <div className={`${isSidebarCollapsed ? 'mt-2' : 'mt-2 ml-2 border-l border-gray-600 pl-2'}`}>
                    {unit.files.map(file => {
                      const isViewed = viewedFiles.has(file.FileID);
                      const isSelected = selectedFile?.FileID === file.FileID;

                      return (
                        <div
                          key={file.FileID}
                          className={`${isSidebarCollapsed ? 'p-1 flex justify-center' : 'py-1 px-2'} rounded text-sm flex items-center transition-colors ${isSelected
                            ? "bg-blue-600 text-white"
                            : isViewed
                              ? "bg-green-600 text-white hover:bg-green-500"
                              : "text-gray-300 hover:text-white hover:bg-gray-600"
                            }`}
                          title={isSidebarCollapsed ? removeFileExtension(file.FilesName) : ''}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileSelect(file, unit);
                          }}
                        >
                          {isSidebarCollapsed ? (
                            getFileIcon(file.fileType)
                          ) : (
                            <>
                              <span className="mr-2">
                                {getFileIcon(file.fileType)}
                              </span>
                              <span className="truncate flex-grow">
                                {removeFileExtension(file.FilesName)}
                                {isViewed && !isSelected && (
                                  <span className="ml-2 text-xs text-green-300">(viewed)</span>
                                )}
                              </span>
                              {isViewed && (
                                <svg
                                  className="ml-2 h-4 w-4 text-green-300"
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
                            </>
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
      </div>


      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {selectedQuiz ? (
          // Render Quiz component when a quiz is selected
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {selectedQuiz.QuizName}
              </h1>
              <p className="text-gray-600 mt-2">
                Duration: {selectedQuiz.QuizDuration} minutes | Passing Score: {selectedQuiz.PassingPercentage}%
              </p>
            </div>
            <Quiz
              quiz={{
                ...selectedQuiz,
                QuizID: selectedQuiz.QuizID,
                group_id: selectedQuiz.group_id || selectedQuiz.QuizGroupID, // Fallback to QuizGroupID
                title: selectedQuiz.QuizName,
                duration: selectedQuiz.QuizDuration,
                passingPercentage: selectedQuiz.PassingPercentage
              }}
              onQuizComplete={() => {
                setSelectedQuiz(null);
                Swal.fire({
                  title: 'Quiz Completed!',
                  icon: 'success',
                  confirmButtonText: 'OK'
                });
              }}
            />
          </div>
        ) : selectedFile ? (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {selectedFile?.unitName || "Select a Unit"}
              </h1>
              <p className="text-gray-600 mt-2">
                {selectedFile?.unitDescription || ""}
              </p>
              {selectedFile && (
                <h2 className="text-xl font-semibold text-gray-700 mt-4">
                  {removeFileExtension(selectedFile.FilesName)}
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
                    {removeFileExtension(selectedFile.FilesName)}
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
          </>) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 max-w-md">
              <h2 className="text-2xl font-bold mb-4">Select Content</h2>
              <p className="text-gray-600">
                Please select a quiz or file from the sidebar to view its content.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

UnitsWithFiles.propTypes = {
  subModuleId: PropTypes.string.isRequired
};

export default UnitsWithFiles;