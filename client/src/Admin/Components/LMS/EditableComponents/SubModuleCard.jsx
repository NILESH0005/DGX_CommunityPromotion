import React from "react";

const SubModuleCard = ({ submodule }) => {
  return (
    <div className="bg-gray-50 rounded-xl shadow-md p-4 hover:shadow-lg transition">
      <div className="h-32 bg-gray-100 overflow-hidden mb-2">
        {submodule.SubModuleImage ? (
          <img
            src={`data:image/jpeg;base64,${submodule.SubModuleImage}`}
            alt={submodule.SubModuleName}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No Image
          </div>
        )}
      </div>
      <h4 className="text-md font-semibold text-gray-800">
        {submodule.SubModuleName}
      </h4>
      <p className="text-sm text-gray-600">
        {submodule.SubModuleDescription || "No description"}
      </p>
    </div>
  );
};

export default SubModuleCard;
