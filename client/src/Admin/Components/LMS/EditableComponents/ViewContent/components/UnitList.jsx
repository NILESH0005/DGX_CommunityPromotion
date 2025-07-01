import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Tooltip as ReactTooltip } from "react-tooltip";

const UnitList = ({
  units,
  selectedUnit,
  onSelectUnit,
  onEditUnit,
  onDeleteUnit,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Units
        </h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {units.length > 0 ? (
          units
            .filter((unit) => unit)
            .map((unit) => (
              <div
                key={unit.UnitID}
                className={`p-4 cursor-pointer transition-colors duration-200 ${
                  selectedUnit?.UnitID === unit.UnitID
                    ? "bg-blue-50 dark:bg-gray-700"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                onClick={() => onSelectUnit(unit)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    {unit.UnitName}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditUnit(unit);
                      }}
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                      data-tooltip-id="edit-unit-tooltip"
                      data-tooltip-content="Edit Unit"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteUnit(unit.UnitID);
                      }}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                      data-tooltip-id="delete-unit-tooltip"
                      data-tooltip-content="Delete Unit"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No units found
          </div>
        )}
      </div>
      <ReactTooltip id="edit-unit-tooltip" place="top" effect="solid" />
      <ReactTooltip id="delete-unit-tooltip" place="top" effect="solid" />
    </div>
  );
};

export default UnitList;
