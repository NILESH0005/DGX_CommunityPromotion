import React from "react";
import { FaSave, FaTimes } from "react-icons/fa";

const UnitForm = ({
  editedUnitData,
  onFieldChange,
  onSubmit,
  onCancel,
  isSaving,
  error,
}) => {
  return (
    <form onSubmit={onSubmit} className="p-6 space-y-4">
      <div>
        <label
          htmlFor="UnitName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Unit Name
        </label>
        <input
          type="text"
          id="UnitName"
          name="UnitName"
          value={editedUnitData.UnitName || ""}
          onChange={(e) => onFieldChange("UnitName", e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
          placeholder="Unit Name"
          required
        />
      </div>
      <div>
        <label
          htmlFor="UnitDescription"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Description
        </label>
        <textarea
          id="UnitDescription"
          name="UnitDescription"
          value={editedUnitData.UnitDescription || ""}
          onChange={(e) => onFieldChange("UnitDescription", e.target.value)}
          rows={3}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
          placeholder="Description"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-md text-sm animate-fade-in">
          {error}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center justify-center min-w-32 disabled:opacity-50"
        >
          {isSaving ? (
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
            <>
              <FaSave className="mr-2" />
              Save Changes
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200 flex items-center"
        >
          <FaTimes className="mr-2" />
          Cancel
        </button>
      </div>
    </form>
  );
};

export default UnitForm;