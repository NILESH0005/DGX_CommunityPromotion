import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom'; // Add this import
import ApiContext from '../../context/ApiContext';
import FileViewer from '../../utils/FileViewer';

const UnitsWithFiles = () => { // Remove the prop since we'll get it from URL
  const { subModuleId } = useParams(); // Get the ID from URL
  const [allUnits, setAllUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchData } = useContext(ApiContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);


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

          // Filter units based on subModuleId with type safety
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

  const handleDownload = (file) => {
    if (!file.FilePath) return;

    const link = document.createElement('a');
    link.href = file.FilePath;
    link.setAttribute('download', `${file.FilesName.toLowerCase().replace(/\s+/g, '_')}.${file.FileType}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileType = (mimeType) => {
    if (!mimeType) return 'unknown';

    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'ppt';
    if (mimeType.includes('word')) return 'doc';
    if (mimeType.includes('excel')) return 'xls';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('text')) return 'text';

    return 'unknown';
  };



  const renderFileContent = () => {
    if (!selectedFile) return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a file to view its content
      </div>
    );

    const fileType = getFileType(selectedFile.FileType);
    const fileUrl = `localhost:8000${selectedFile.FilePath}`;
    console.log('File URL:', fileUrl); 

    switch (fileType) {
      case "pdf":
        return (
          <iframe
            key={selectedFile.FileID}
            src={fileUrl}
            className="w-full h-full"
            allowFullScreen
            title={`${selectedFile.FilesName} Viewer`}
            sandbox="allow-scripts allow-same-origin"
          />
        );
      case "ppt":
      case "pptx":
        return (
          <iframe
            // src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
            className="w-full h-full"
            allowFullScreen
            title={`${selectedFile.FilesName} Viewer`}
            sandbox="allow-scripts allow-same-origin"
          />
        );
      case "doc":
      case "docx":
        return (
          <iframe
            // src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
            className="w-full h-full"
            allowFullScreen
            title={`${selectedFile.FilesName} Viewer`}
            sandbox="allow-scripts allow-same-origin"
          />
        );
      case "image":
        return (
          <div className="flex items-center justify-center h-full">
            <img
              src={fileUrl}
              alt={selectedFile.FilesName}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold mb-2">{selectedFile.FilesName}</h3>
            <p className="text-gray-500 mb-6">This file type cannot be previewed</p>
            <button
              onClick={() => handleDownload(selectedFile)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download File
            </button>
          </div>
        );
    }
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
              className="p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
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
                  {unit.files.map(file => (
                    <div
                      key={file.FileID}
                      className={`py-1 px-2 rounded text-sm flex items-center ${selectedFile?.FileID === file.FileID
                        ? "bg-gray-600 text-white"
                        : "text-gray-300 hover:text-white"
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile({
                          ...file,
                          unitName: unit.UnitName,
                          unitDescription: unit.UnitDescription
                        });
                      }}
                    >
                      <span className="mr-2">
                        {file.fileType === "pdf" ? "📄" :
                          file.fileType === "ipynb" ? "📓" :
                            file.fileType === "docx" ? "📝" : "📁"}
                      </span>
                      <span className="truncate">{file.FilesName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
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
            </h2>
          )}
        </div>

        <div className="flex-1 w-full border rounded-xl shadow-lg relative ov erflow-hidden bg-white">
          {/* {renderFileContent()} */}
          <FileViewer fileUrl={`http://localhost:8000${selectedFile.FilePath}`} />
        </div>
      </div>
    </div>
  );
};

UnitsWithFiles.propTypes = {
  subModuleId: PropTypes.string.isRequired
};

export default UnitsWithFiles;