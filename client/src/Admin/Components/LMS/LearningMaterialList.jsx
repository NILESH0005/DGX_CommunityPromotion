import React, { useEffect, useState, useContext } from "react";
import ApiContext from "../../../context/ApiContext";
import ModuleCard from "../../../Admin/Components/LMS/EditableComponents/ModuleCard.jsx";

const LearningMaterialList = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchData } = useContext(ApiContext);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await fetchData("dropdown/getModules", "GET");
        
        if (response?.success) {
          setModules(response.data);
        } else {
          setError(response?.message || "Failed to fetch modules");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching modules");
        console.error("Error fetching modules:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 text-center">
        Error: {error}
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="p-6 text-gray-500 text-center">
        No modules found. Create your first module to get started.
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {modules.map((module) => (
        <ModuleCard 
          key={module.ModuleID} 
          module={module} 
        />
      ))}
    </div>
  );
};

export default LearningMaterialList;