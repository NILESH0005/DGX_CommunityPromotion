import React, { useState, useEffect, useContext } from "react";
import ApiContext from "../../../../context/ApiContext";
import SubModuleCard from "./SubModuleCard.jsx";
import ByteArrayImage from "../../../../utils/ByteArrayImage.jsx";

const ModuleCard = ({ module }) => {
  const [expanded, setExpanded] = useState(false);
  const [subModules, setSubModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const { fetchData } = useContext(ApiContext);
console.log(module);

  const handleToggle = async () => {
    setExpanded(!expanded);

    if (!expanded && subModules.length === 0) {
      setLoading(true);
      const response = await fetchData(`lms/getSubModules?moduleId=${module.ModuleID}`, "GET");
      console.log("response is", response)
      if (response?.success) {
        setSubModules(response.data);
      }
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      <div className="cursor-pointer" onClick={handleToggle}>
        <div className="h-40 bg-gray-100 overflow-hidden">
          {module.ModuleImage ? (
            <ByteArrayImage byteArray={module.ModuleImage.data} />
          ) : (
            <div className="flex items-center justify-center text-gray-400 text-sm">
              No Image
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {module.ModuleName}
          </h3>
          <p className="text-gray-600 text-sm">
            {module.ModuleDescription || "No description available"}
          </p>
        </div>
      </div>

      {expanded && (
        <div className="bg-gray-50 p-4">
          {loading ? (
            <div className="text-sm text-gray-500">Loading submodules...</div>
          ) : subModules.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {subModules.map((sub) => (
                <SubModuleCard key={sub.SubModuleID} submodule={sub} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No submodules available.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleCard;
