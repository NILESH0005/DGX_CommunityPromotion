// import React, { useState, useEffect, useContext } from 'react';
// import ApiContext from '../../../context/ApiContext';
// import { FaEye, FaTrash, FaPlus } from 'react-icons/fa';
// import Swal from 'sweetalert2';

// const LearningMaterialTable = () => {
//     const [modules, setModules] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [searchTerm, setSearchTerm] = useState("");
//     const { fetchData } = useContext(ApiContext);


//     useEffect(() => {
//         const fetchModules = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 console.log("Attempting to fetch modules..."); // Debug log

//                 const response = await fetchData(
//                     "dropdown/getModules",
//                     "GET",
//                     null,
//                     { "Content-Type": "application/json" }
//                 ).catch(err => {
//                     console.error("Fetch error:", err);
//                     throw new Error("Network request failed");
//                 });

//                 console.log("API Response:", response); // Debug log

//                 if (!response) {
//                     throw new Error("No response received from server");
//                 }

//                 // Some APIs return data directly, others wrap it in response.data
//                 const responseData = response.data || response;

//                 if (response.success || Array.isArray(responseData)) {
//                     const data = Array.isArray(responseData) ? responseData : [];
//                     setModules(data);
//                 } else {
//                     throw new Error(response.message || "Failed to fetch modules");
//                 }
//             } catch (err) {
//                 console.error("Error in fetchModules:", err);
//                 setError(err.message || "Failed to load modules");
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Error',
//                     text: err.message || 'Failed to load modules'
//                 });
//             } finally {
//                 setLoading(false);
//             }
//         };
// // 
//         fetchModules();
//     }, [fetchData]);

//     const filteredModules = modules.filter(module => {
//         return module?.ModuleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             module?.ModuleDescription?.toLowerCase().includes(searchTerm.toLowerCase());
//     });

//     if (loading) return (
//         <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//     );

//     if (error) return (
//         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
//             <p>{error}</p>
//             <button
//                 onClick={() => window.location.reload()}
//                 className="mt-2 text-sm text-blue-600 hover:text-blue-800"
//             >
//                 Try again
//             </button>
//         </div>
//     );

//     return (
//         <div className="mt-6 p-4 bg-white rounded-lg shadow">
//             <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-semibold text-gray-800">Learning Modules</h2>
//                 <div className="flex items-center space-x-4">
//                     <input
//                         type="text"
//                         placeholder="Search modules..."
//                         className="p-2 border rounded text-sm w-64"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                     <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition flex items-center">
//                         <FaPlus className="mr-2" />
//                         Add Module
//                     </button>
//                 </div>
//             </div>

//             {filteredModules.length > 0 ? (
//                 <div className="overflow-hidden rounded-lg border border-gray-300">
//                     <div className="overflow-auto">
//                         <table className="w-full">
//                             <thead className="bg-gray-100">
//                                 <tr>
//                                     <th className="p-3 text-left text-sm font-semibold text-gray-700">#</th>
//                                     <th className="p-3 text-left text-sm font-semibold text-gray-700">Module Name</th>
//                                     <th className="p-3 text-left text-sm font-semibold text-gray-700">Description</th>
//                                     <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-200">
//                                 {filteredModules.map((module, index) => (
//                                     <tr key={module.ModuleID} className="hover:bg-gray-50">
//                                         <td className="p-3 text-sm text-gray-700">{index + 1}</td>
//                                         <td className="p-3 text-sm font-medium text-gray-800">{module.ModuleName}</td>
//                                         <td className="p-3 text-sm text-gray-600">
//                                             {module.ModuleDescription || "-"}
//                                         </td>
//                                         <td className="p-3 text-sm">
//                                             <div className="flex space-x-2">
//                                                 <button className="text-blue-500 hover:text-blue-700 p-1">
//                                                     <FaEye />
//                                                 </button>
//                                                 <button className="text-red-500 hover:text-red-700 p-1">
//                                                     <FaTrash />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             ) : (
//                 <div className="text-center py-8">
//                     <p className="text-gray-500">
//                         {searchTerm ? "No modules match your search" : "No modules found"}
//                     </p>
//                     {modules.length === 0 && !loading && (
//                         <button
//                             onClick={() => window.location.reload()}
//                             className="mt-2 text-sm text-blue-600 hover:text-blue-800"
//                         >
//                             Refresh
//                         </button>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default LearningMaterialTable;
import React from 'react'

const LearningMaterialList = () => {
    return (
        <div>LearningMaterialList</div>
    )
}

export default LearningMaterialList