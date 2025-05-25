import React, { useEffect, useState, useContext } from "react";
import ApiContext from "../../../context/ApiContext";
import EditModule from "./EditableComponents/EditModule.jsx";
import EditSubModule from "./EditableComponents/EditSubModule.jsx";
import Swal from 'sweetalert2';

const LearningMaterialList = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const { fetchData, userToken } = useContext(ApiContext);

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

  const handleViewSubmodules = (module) => {
    setSelectedModule(module);
  };

  const handleBackToList = () => {
    setSelectedModule(null);
  };

  const handleDeleteModule = async (moduleId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      console.log("Deleting module with ID:", moduleId, typeof moduleId); // Debug log

      const response = await fetchData(
        "lmsEdit/deleteModule",
        "POST",
        { moduleId }, // Explicitly convert to number
        {
          "Content-Type": "application/json",
          "auth-token": userToken
        }
      );

      if (response?.success) {
        setModules(prev => prev.filter(mod => mod.ModuleID !== moduleId));
        Swal.fire(
          'Deleted!',
          'Module has been deleted.',
          'success'
        );
      } else {
        throw new Error(response?.message || "Failed to delete module");
      }
    } catch (err) {
      console.error("Full error details:", err);
      Swal.fire(
        'Error!',
        `Failed to delete module: ${err.message}`,
        'error'
      );
    }
  };

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

  if (selectedModule) {
    return (
      <EditSubModule
        module={selectedModule}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Added Module Details Heading */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Module Details</h1>
        <p className="text-gray-600 mt-1">Manage all learning modules</p>
      </div>

      {modules.length === 0 ? (
        <div className="text-gray-500 text-center">
          No modules found. Create your first module to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {modules.map((module) => (
            <EditModule
              key={module.ModuleID}
              module={module}
              onDelete={handleDeleteModule}
              onViewSubmodules={handleViewSubmodules}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LearningMaterialList;