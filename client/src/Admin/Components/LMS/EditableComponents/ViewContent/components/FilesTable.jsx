import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Tooltip as ReactTooltip } from "react-tooltip";

const FilesTable = ({
  files,
  selectedFiles,
  onToggleFileSelection,
  onEditFile,
  onDeleteFile,
  editingFile,
  editedFileData,
  onFieldChange,
  onCancelEdit,
  onUpdateFile,
  isUploading,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={
                  selectedFiles.length === files.length && files.length > 0
                }
                onChange={() => {
                  if (selectedFiles.length === files.length) {
                    onToggleFileSelection([]);
                  } else {
                    onToggleFileSelection(files.map((file) => file.FileID));
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              File Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Uploaded By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {files.map((file) => (
            <React.Fragment key={file.FileID}>
              {/* Normal View Row */}
              <tr
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  editingFile?.FileID === file.FileID ? "hidden" : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.FileID)}
                    onChange={() => onToggleFileSelection(file.FileID)}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {file.FilesName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {file.FileType}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {file.AuthAdd}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditFile(file);
                      }}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      data-tooltip-id="edit-file-tooltip"
                      data-tooltip-content="Edit File"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(file.FileID);
                      }}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      data-tooltip-id="delete-file-tooltip"
                      data-tooltip-content="Delete File"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Edit View Row (only shown when editing this file) */}
              {editingFile?.FileID === file.FileID && (
                <tr
                  className="bg-blue-50 dark:bg-gray-700"
                  key={`edit-row-${file.FileID}`}
                >
                  <td colSpan="5" className="px-6 py-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {file.FileType === "link"
                              ? "Link Title"
                              : "File Name"}
                          </label>
                          <input
                            type="text"
                            value={editedFileData.fileName}
                            onChange={(e) =>
                              onFieldChange("fileName", e.target.value)
                            }
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        {file.FileType === "link" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Link URL
                            </label>
                            <input
                              type="url"
                              value={editedFileData.link}
                              onChange={(e) =>
                                onFieldChange("link", e.target.value)
                              }
                              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      {file.FileType === "link" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                          </label>
                          <textarea
                            value={editedFileData.description}
                            onChange={(e) =>
                              onFieldChange("description", e.target.value)
                            }
                            rows={3}
                            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}

                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={onCancelEdit}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={onUpdateFile}
                          disabled={isUploading}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center"
                        >
                          {isUploading ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <ReactTooltip id="edit-file-tooltip" place="top" effect="solid" />
      <ReactTooltip id="delete-file-tooltip" place="top" effect="solid" />
    </div>
  );
};

export default FilesTable;