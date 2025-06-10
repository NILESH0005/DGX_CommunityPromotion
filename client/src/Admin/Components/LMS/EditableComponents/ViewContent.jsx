import React, { useState, useEffect, useContext, useRef } from "react";
import ApiContext from "../../../../context/ApiContext";
import Swal from "sweetalert2";
import AddUnitModal from "./AddUnitModal";
import {
  FaEdit,
  FaTrash,
  FaFolder,
  FaSave,
  FaTimes,
  FaUpload,
  FaFile,
  FaLink,
  FaChevronRight,
} from "react-icons/fa";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { Link } from "react-router-dom";
import EditModule from "./EditModule";

const ViewContent = ({ submodule, onBack }) => {
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [editedUnitData, setEditedUnitData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [files, setFiles] = useState([]);
  const [newFile, setNewFile] = useState(null);
  const fileInputRef = useRef(null);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [fileLink, setFileLink] = useState("");
  const [linkName, setLinkName] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { fetchData, userToken } = useContext(ApiContext);

  useEffect(() => {
    // Trigger a refetch of units to ensure we have the latest data
    const fetchUnits = async () => {
      try {
        setLoading(true);
        const response = await fetchData(
          `dropdown/getUnitsWithFiles/${submodule.SubModuleID}`,
          "GET",
          { "auth-token": userToken }
        );

        if (response?.success) {
          const validUnits = response.data.filter((unit) => unit);
          setUnits(validUnits);
          const filtered = validUnits.filter(
            (unit) => unit.SubModuleID === submodule.SubModuleID
          );
          setFilteredUnits(filtered);

          // Select the newly added unit if it exists in the response
          const addedUnit = validUnits.find(
            (unit) => unit.UnitID === newUnit.UnitID
          );
          if (addedUnit) {
            setSelectedUnit(addedUnit);
          }
        }
      } catch (err) {
        console.error("Error refetching units:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
    setShowAddUnitModal(false);

    fetchUnits();
  }, [submodule.SubModuleID, fetchData, userToken]);

  useEffect(() => {
    if (selectedUnit) {
      const fetchFiles = async () => {
        try {
          const unitWithFiles = units.find(
            (unit) => unit.UnitID === selectedUnit.UnitID
          );
          if (unitWithFiles && unitWithFiles.files) {
            setFiles(unitWithFiles.files);
          } else {
            const response = await fetchData(
              `lms/getFiles?unitId=${selectedUnit.UnitID}`,
              "GET",
              null,
              { "auth-token": userToken }
            );
            if (response?.success) {
              setFiles(response.data);
            }
          }
        } catch (err) {
          console.error("Error fetching files:", err);
          setFiles([]);
        }
      };
      fetchFiles();
    }
  }, [selectedUnit, units, fetchData, userToken]);

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setEditedUnitData({
      UnitName: unit.UnitName,
      UnitDescription: unit.UnitDescription,
    });
  };

  const handleCancelEditUnit = () => {
    setEditingUnit(null);
    setEditedUnitData({});
  };

  const handleUpdateUnit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        UnitName: editedUnitData.UnitName,
        UnitDescription: editedUnitData.UnitDescription,
        SubModuleID: submodule.SubModuleID,
      };

      const headers = {
        "Content-Type": "application/json",
        "auth-token": userToken,
      };

      const response = await fetchData(
        `lmsEdit/updateUnit/${editingUnit.UnitID}`,
        "POST",
        payload,
        headers
      );

      if (response?.success) {
        // Update both states using functional updates to ensure we have the latest state
        setUnits((prevUnits) =>
          prevUnits.map((unit) =>
            unit.UnitID === editingUnit.UnitID
              ? { ...unit, ...response.data }
              : unit
          )
        );

        setFilteredUnits((prevFilteredUnits) =>
          prevFilteredUnits.map((unit) =>
            unit.UnitID === editingUnit.UnitID
              ? { ...unit, ...response.data }
              : unit
          )
        );

        // Update selectedUnit if it's the one being edited
        if (selectedUnit?.UnitID === editingUnit.UnitID) {
          setSelectedUnit((prev) => ({ ...prev, ...response.data }));
        }

        handleCancelEditUnit();
        Swal.fire("Success!", "Unit updated successfully", "success");
      } else {
        throw new Error(response?.message || "Failed to update unit");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUnit = async (unitId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "OK",
    });

    if (!result.isConfirmed) return;

    try {
      setUnits((prev) =>
        prev.map((unit) =>
          unit.UnitID === unitId ? { ...unit, delStatus: 1 } : unit
        )
      );
      setFilteredUnits((prev) =>
        prev.map((unit) =>
          unit.UnitID === unitId ? { ...unit, delStatus: 1 } : unit
        )
      );

      if (selectedUnit?.UnitID === unitId) {
        setSelectedUnit(null);
        setFiles([]);
      }

      const response = await fetchData(
        "lmsEdit/deleteUnit",
        "POST",
        { unitId },
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      if (!response?.success) {
        setUnits((prev) =>
          prev.map((unit) =>
            unit.UnitID === unitId ? { ...unit, delStatus: 0 } : unit
          )
        );
        setFilteredUnits((prev) =>
          prev.map((unit) =>
            unit.UnitID === unitId ? { ...unit, delStatus: 0 } : unit
          )
        );
        throw new Error(response?.message || "Failed to delete unit");
      }

      setUnits((prev) => prev.filter((unit) => unit.UnitID !== unitId));
      setFilteredUnits((prev) => prev.filter((unit) => unit.UnitID !== unitId));

      Swal.fire("Deleted!", "Unit has been deleted.", "success");
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire("Error!", `Failed to delete unit: ${err.message}`, "error");
    }
  };

  const handleAddUnitClick = () => {
    setShowAddUnitModal(true);
  };

  const handleFileChange = (e) => {
    setNewFile(e.target.files[0]);
  };

  // const handleUploadFile = async () => {
  //   if ((!newFile && !fileLink.trim()) || !selectedUnit) return;
  //   console.log("new file", newFile);

  //   setIsUploading(true);
  //   try {
  //     const uploadToast = Swal.fire({
  //       title: "Uploading...",
  //       allowOutsideClick: false,
  //       didOpen: () => Swal.showLoading(),
  //     });

  //     const totalFilesAfterUpload = files.length + 1;
  //     const equalPercentage = (100 / totalFilesAfterUpload).toFixed(2);
  //     console.log("myfile", newFile);
  //     if (newFile) {
  //       const formData = new FormData();
  //       formData.append("file", newFile);
  //       console.log("Selected Unit ID:", selectedUnit.UnitID); // Debug log

  //       formData.append("unitId", selectedUnit.UnitID);
  //       formData.append("percentage", equalPercentage);
  //       console.log("mydata", formData);
  //       const response = await fetch(
  //         `${import.meta.env.VITE_API_BASEURL}lms/files`,
  //         {
  //           method: "POST",
  //           body: formData,
  //           headers: {
  //             "auth-token": userToken,
  //           },
  //         }
  //       );
  //       console.log("response", response);

  //       if (!response.ok) {
  //         const errorData = await response.json().catch(() => ({}));
  //         throw new Error(errorData.message || "Upload failed");
  //       }

  //       const result = await response.json();
  //       await uploadToast.close();

  //       if (result.success) {
  //         const updatedFiles = files.map((file) => ({
  //           ...file,
  //           Percentage: equalPercentage,
  //         }));

  //         setFiles([
  //           ...updatedFiles,
  //           {
  //             ...result.data,
  //             Percentage: equalPercentage,
  //           },
  //         ]);

  //         setNewFile(null);
  //         setFileLink("");
  //         Swal.fire("Success!", "File uploaded successfully", "success");
  //       } else {
  //         throw new Error(result.message || "Failed to save");
  //       }
  //     } else if (fileLink.trim()) {
  //       const response = await fetchData(
  //         "lms/files",
  //         "POST",
  //         {
  //           unitId: selectedUnit.UnitID,
  //           link: fileLink,
  //           percentage: equalPercentage,
  //           fileName: fileLink.split("/").pop() || "Link",
  //           fileType: "link",
  //         },
  //         {
  //           "Content-Type": "application/json",
  //           "auth-token": userToken,
  //         }
  //       );
  //       console.log("response", response);

  //       await uploadToast.close();

  //       if (response?.success) {
  //         const updatedFiles = files.map((file) => ({
  //           ...file,
  //           Percentage: equalPercentage,
  //         }));

  //         setFiles([
  //           ...updatedFiles,
  //           {
  //             ...response.data,
  //             Percentage: equalPercentage,
  //           },
  //         ]);

  //         setNewFile(null);
  //         setFileLink("");
  //         Swal.fire("Success!", "Link saved successfully", "success");
  //       } else {
  //         throw new Error(response?.message || "Failed to save link");
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Upload error:", err);
  //     Swal.fire("Error!", err.message || "Failed to save", "error");
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  const handleUploadFile = async () => {
    // Validate inputs
    if ((!newFile && !fileLink.trim()) || !selectedUnit) return;

    setIsUploading(true);
    try {
      const uploadToast = Swal.fire({
        title: "Uploading...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const totalFilesAfterUpload = files.length + 1;
      const equalPercentage = (100 / totalFilesAfterUpload).toFixed(2);

      // Handle file upload
      if (newFile) {
        const formData = new FormData();
        formData.append("file", newFile);
        formData.append("unitId", selectedUnit.UnitID);
        formData.append("percentage", equalPercentage);
        formData.append("fileName", linkName || newFile.name);
        formData.append("description", linkDescription || "");

        const response = await fetch(
          `${import.meta.env.VITE_API_BASEURL}lms/files`,
          {
            method: "POST",
            body: formData,
            headers: {
              "auth-token": userToken,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Upload failed");
        }

        const result = await response.json();
        await uploadToast.close();

        if (result.success) {
          const updatedFiles = files.map((file) => ({
            ...file,
            Percentage: equalPercentage,
          }));

          setFiles([
            ...updatedFiles,
            {
              ...result.data,
              Percentage: equalPercentage,
            },
          ]);

          resetForm();
          Swal.fire("Success!", "File uploaded successfully", "success");
        } else {
          throw new Error(result.message || "Failed to save");
        }
      }
      // Handle link submission
      else if (fileLink.trim()) {
        const response = await fetchData(
          "lms/files",
          "POST",
          {
            unitId: selectedUnit.UnitID,
            link: fileLink,
            percentage: equalPercentage,
            fileName: linkName || "Link",
            description: linkDescription || "",
            fileType: "link",
          },
          {
            "Content-Type": "application/json",
            "auth-token": userToken,
          }
        );

        await uploadToast.close();

        if (response?.success) {
          const updatedFiles = files.map((file) => ({
            ...file,
            Percentage: equalPercentage,
          }));

          setFiles([
            ...updatedFiles,
            {
              ...response.data,
              Percentage: equalPercentage,
            },
          ]);

          resetForm();
          Swal.fire("Success!", "Link saved successfully", "success");
        } else {
          throw new Error(response?.message || "Failed to save link");
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      Swal.fire("Error!", err.message || "Failed to save", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to reset form fields
  const resetForm = () => {
    setNewFile(null);
    setFileLink("");
    setLinkName("");
    setLinkDescription("");
  };
  const handleDeleteFile = async (fileId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      setFiles((prev) => prev.filter((file) => file.FileID !== fileId));
      const response = await fetchData(
        "lmsEdit/deleteFile",
        "POST",
        { fileId },
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      if (response?.success) {
        setFiles((prev) => prev.filter((file) => file.FileID !== fileId));
        Swal.fire("Deleted!", "File has been deleted.", "success");
      }
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire("Error!", "Failed to delete file", "error");
    }
  };

  const handleAddUnitSuccess = (newUnit) => {
    if (!newUnit || !newUnit.UnitID) {
      console.error("Invalid unit data received:", newUnit);
      return;
    }

    setUnits((prev) => [...prev, newUnit]);
    if (newUnit.SubModuleID === submodule.SubModuleID) {
      setFilteredUnits((prev) => [...prev, newUnit]);
    }
    setSelectedUnit(newUnit);
    setShowAddUnitModal(false);
  };

  if (loading) {
    return <div className="text-center py-10">Loading units...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Back to Submodules
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AddUnitModal
        isOpen={showAddUnitModal}
        onClose={() => setShowAddUnitModal(false)}
        onAddUnit={handleAddUnitSuccess}
        submodule={submodule}
        fetchData={fetchData}
        userToken={userToken}
      />

      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="text-lg flex items-center  text-black  mb-6">
          <button
            onClick={() => onBack(EditModule)} // Pass the module data back
            className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
          >
            Modules
          </button>
          <FaChevronRight className="text-lg mx-2  text-black " />
          <button
            onClick={onBack} // Default back behavior
            className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
          >
            Submodules
          </button>
          <FaChevronRight className="mx-2 text-xs text-black " />
          <span className="text-lg text-black dark:text-black-100 font-medium">
            {submodule.SubModuleName}
          </span>
        </div>

        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleAddUnitClick}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center"
          >
            <FaEdit className="mr-2" />
            Add New Unit
          </button>
          {/* <h1 className="text-2xl font-bold text-Black-800 dark:text-black">
            Content for:{" "}
            <span className="text-red-600 dark:text-red-400">
              {submodule.SubModuleName}
            </span>
          </h1> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Units List */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Units
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUnits.length > 0 ? (
                  filteredUnits
                    .filter((unit) => unit)
                    .map((unit) => (
                      <div
                        key={unit.UnitID}
                        className={`p-4 cursor-pointer transition-colors duration-200 ${
                          selectedUnit?.UnitID === unit.UnitID
                            ? "bg-blue-50 dark:bg-gray-700"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => setSelectedUnit(unit)}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-800 dark:text-white">
                            {unit.UnitName}
                          </h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditUnit(unit);
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
                                handleDeleteUnit(unit.UnitID);
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
            </div>
          </div>

          {/* Unit Details and Files */}
          <div className="md:col-span-2">
            {selectedUnit ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                {editingUnit?.UnitID === selectedUnit.UnitID ? (
                  <form onSubmit={handleUpdateUnit} className="p-6 space-y-4">
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
                        onChange={(e) =>
                          setEditedUnitData({
                            ...editedUnitData,
                            UnitName: e.target.value,
                          })
                        }
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
                        onChange={(e) =>
                          setEditedUnitData({
                            ...editedUnitData,
                            UnitDescription: e.target.value,
                          })
                        }
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
                        onClick={handleCancelEditUnit}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200 flex items-center"
                      >
                        <FaTimes className="mr-2" />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                        {selectedUnit.UnitName}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedUnit.UnitDescription}
                      </p>
                    </div>

                    {/* Files Section */}
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                          Files
                        </h3>
                      </div>

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
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </div>

                          {/* Link Input Section */}
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
                                  onChange={(e) => setFileLink(e.target.value)}
                                  placeholder="Enter URL/link"
                                  className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                                />
                              </div>
                              <input
                                type="text"
                                value={linkName}
                                onChange={(e) => setLinkName(e.target.value)}
                                placeholder="Link name/title"
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                              />
                              <textarea
                                value={linkDescription}
                                onChange={(e) =>
                                  setLinkDescription(e.target.value)
                                }
                                placeholder="Link description"
                                rows={3}
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                              />
                            </div>
                          </div>

                          {/* Selected File Preview */}
                          {newFile && (
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                              <span className="text-sm text-gray-800 dark:text-gray-200 flex items-center">
                                <FaFile className="mr-2" />
                                {newFile.name}
                              </span>
                              <button
                                onClick={() => setNewFile(null)}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          )}

                          {/* Save Button */}
                          <button
                            onClick={handleUploadFile}
                            disabled={
                              (!newFile && !fileLink.trim()) || isUploading
                            }
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
                                Save
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {files.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
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
                                <tr
                                  key={file.FileID}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
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
                                    <button
                                      onClick={() =>
                                        handleDeleteFile(file.FileID)
                                      }
                                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                      data-tooltip-id="delete-file-tooltip"
                                      data-tooltip-content="Delete File"
                                    >
                                      <FaTrash />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          No files uploaded yet
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Select a unit to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tooltips */}
      <ReactTooltip id="edit-unit-tooltip" place="top" effect="solid" />
      <ReactTooltip id="delete-unit-tooltip" place="top" effect="solid" />
      <ReactTooltip id="delete-file-tooltip" place="top" effect="solid" />
    </div>
  );
};

export default ViewContent;
