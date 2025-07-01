import React from "react";
import { FaUpload, FaFile, FaTimes, FaSave, FaLink } from "react-icons/fa";

const FileUploadSection = ({
  fileInputRef,
  onFileChange,
  newFiles,
  onRemoveFile,
  onCustomNameChange,
  fileLink,
  onFileLinkChange,
  linkName,
  onLinkNameChange,
  linkDescription,
  onLinkDescriptionChange,
  onUpload,
  isUploading,
}) => {
  return (
    <div className="mb-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload File
          </label>
          <div
            onClick={() => fileInputRef.current.click()}
            className="p-8 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200 flex flex-col items-center justify-center"
          >
            <FaUpload className="text-3xl text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click to browse or drag and drop files here
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Supported formats: PDF, DOCX, JPG, PNG, etc.
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            className="hidden"
            multiple
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Or Add Link
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FaLink className="text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                value={fileLink}
                onChange={(e) => onFileLinkChange(e.target.value)}
                placeholder="Enter URL/link"
                className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              />
            </div>
            <input
              type="text"
              value={linkName}
              onChange={(e) => onLinkNameChange(e.target.value)}
              placeholder="Link name/title"
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
            />
            <textarea
              value={linkDescription}
              onChange={(e) => onLinkDescriptionChange(e.target.value)}
              placeholder="Link description"
              rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
            />
          </div>
        </div>

        {newFiles.length > 0 && (
          <div className="space-y-2">
            {newFiles.map((fileObj, index) => (
              <div
                key={index}
                className="flex flex-col bg-gray-50 dark:bg-gray-700 p-2 rounded"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-800 dark:text-gray-200 flex items-center">
                    <FaFile className="mr-2" />
                    {fileObj.name}
                  </span>
                  <button
                    onClick={() => onRemoveFile(index)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <FaTimes />
                  </button>
                </div>
                <input
                  type="text"
                  value={fileObj.customName}
                  onChange={(e) => onCustomNameChange(index, e.target.value)}
                  placeholder="Custom file name"
                  className="mt-2 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md"
                />
              </div>
            ))}
          </div>
        )}
        <button
          onClick={onUpload}
          disabled={(newFiles.length === 0 && fileLink.trim() === "") || isUploading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
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
              Uploading...
            </>
          ) : (
            <>
              <FaSave className="mr-2" />
              {newFiles.length > 0 || fileLink.trim()
                ? "Upload Content"
                : "Save"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FileUploadSection;