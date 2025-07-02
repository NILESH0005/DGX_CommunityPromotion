import React, { useState, useEffect, useContext, useRef } from "react";
import ApiContext from "../../../../context/ApiContext";
import Swal from "sweetalert2";
import AddUnitModal from "./AddUnitModal";
import UnitOrder from "./UnitOrder";
import FilesOrder from "./FilesOrder";
import { useCallback } from "react";
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
  const [showUnitOrder, setShowUnitOrder] = useState(false);
  const [showFilesOrder, setShowFilesOrder] = useState(false);
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [editedUnitData, setEditedUnitData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  // Change from single file to array of files
  const [newFiles, setNewFiles] = useState([]);
  const [fileLinks, setFileLinks] = useState([]);
  const [fileLink, setFileLink] = useState(""); // Add this line
  const [linkName, setLinkName] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [editedFileData, setEditedFileData] = useState({
    fileName: "",
    description: "",
    link: "",
  });

  const { fetchData, userToken } = useContext(ApiContext);

  const fetchFilesForUnit = useCallback(async (unitId) => {
    try {
      const response = await fetchData(
        `lmsEdit/getFiles?unitId=${unitId}`,
        "GET",
        null,
        { "auth-token": userToken }
      );
      if (response?.success) {
        setFiles(response.data);
      } else {
        setFiles([]);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
      setFiles([]);
    }
  }, [fetchData, userToken]);

  useEffect(() => {
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
        }
      } catch (err) {
        console.error("Error refetching units:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
    setShowAddUnitModal(false);
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


  const handleDeleteMultipleFiles = async (fileIds) => {
    const result = await Swal.fire({
      title: `Are you sure you want to delete ${fileIds.length} files?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete them!",
    });

    if (!result.isConfirmed) return;

    try {
      // Optimistically update UI
      setFiles((prev) => prev.filter((file) => !fileIds.includes(file.FileID)));
      setSelectedFiles([]);

      // Call API to delete files
      const response = await fetchData(
        "lmsEdit/deleteMultipleFiles",
        "POST",
        { fileIds },
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      if (!response?.success) {
        const filesResponse = await fetchData(
          `lms/getFiles?unitId=${selectedUnit.UnitID}`,
          "GET",
          null,
          { "auth-token": userToken }
        );
        if (filesResponse?.success) {
          setFiles(filesResponse.data);
        }
        throw new Error(response?.message || "Failed to delete files");
      }

      Swal.fire(
        "Deleted!",
        `${fileIds.length} files have been deleted.`,
        "success"
      );
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire("Error!", `Failed to delete files: ${err.message}`, "error");
    }
  };

  const handleSaveFilesOrder = async (orderedFiles) => {
    try {
      // Validate input
      if (
        !orderedFiles ||
        !Array.isArray(orderedFiles) ||
        orderedFiles.length === 0
      ) {
        throw new Error("No files to update");
      }
      const equalPercentage = (100 / orderedFiles.length).toFixed(2);
      const filesWithOrder = orderedFiles.map((file, index) => ({
        FileID: file.FileID,
        Percentage: equalPercentage, // Distribute percentage equally
        SortingOrder: index + 1, // 1-based index
      }));
      const validFiles = filesWithOrder.filter(
        (file) =>
          file.FileID && Number.isInteger(file.FileID) && file.FileID > 0
      );

      const response = await fetchData(
        "lmsEdit/updateFilesOrder",
        "POST",
        { files: validFiles },
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      if (response?.success) {
        const updatedFiles = files
          .map((file) => {
            const updatedFile = validFiles.find(
              (f) => f.FileID === file.FileID
            );
            return updatedFile
              ? {
                ...file,
                SortingOrder: updatedFile.SortingOrder,
                Percentage: updatedFile.Percentage,
              }
              : file;
          })
          .sort((a, b) => (a.SortingOrder || 0) - (b.SortingOrder || 0));

        setFiles(updatedFiles);
        setShowFilesOrder(false);

        Swal.fire(
          "Success!",
          "Files order and percentages have been updated.",
          "success"
        );
      } else {
        throw new Error(response?.message || "Failed to update files order");
      }
    } catch (err) {
      console.error("Error updating files order:", err);
      Swal.fire(
        "Error!",
        err.message || "Failed to update files order",
        "error"
      );
    }
  };

  const handleEditFile = (file) => {
    setEditingFile(file);
    setEditedFileData({
      fileName: file.FilesName,
      description: file.Description || "",
      link: file.FileType === "link" ? file.FilePath : "",
    });
  };

  const handleCancelEditFile = () => {
    setEditingFile(null);
    setEditedFileData({
      fileName: "",
      description: "",
      link: "",
    });
    resetForm();
  };

  const handleUpdateFile = async () => {
    if (!editingFile) return;

    try {
      setIsUploading(true);

      const payload = {
        fileId: editingFile.FileID,
        fileName: editedFileData.fileName,
        description: editedFileData.description,
      };

      if (editingFile.FileType === "link") {
        payload.link = editedFileData.link;
      }

      const response = await fetchData("lmsEdit/updateFile", "POST", payload, {
        "Content-Type": "application/json",
        "auth-token": userToken,
      });

      if (response?.success) {
        setFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.FileID === editingFile.FileID
              ? {
                ...file,
                FilesName: editedFileData.fileName,
                Description: editedFileData.description,
                ...(editingFile.FileType === "link" && {
                  FilePath: editedFileData.link,
                }),
              }
              : file
          )
        );
        handleCancelEditFile();
        Swal.fire("Success!", "File updated successfully", "success");
      } else {
        throw new Error(response?.message || "Failed to update file");
      }
    } catch (err) {
      console.error("Error updating file:", err);
      Swal.fire("Error!", err.message || "Failed to update file", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

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

  const handleSaveUnitOrder = async (orderedUnits) => {
    try {
      // Prepare units with their new order positions
      const unitsWithOrder = orderedUnits.map((unit, index) => ({
        UnitID: unit.UnitID,
        SortingOrder: index + 1,
      }));

      const response = await fetchData(
        "lmsEdit/updateUnitOrder",
        "POST",
        { units: unitsWithOrder },
        {
          "Content-Type": "application/json",
          "auth-token": userToken,
        }
      );

      if (response?.success) {
        // Update local state with new order
        const updatedUnits = [...units]
          .map((unit) => {
            const updatedUnit = unitsWithOrder.find(
              (u) => u.UnitID === unit.UnitID
            );
            return updatedUnit
              ? { ...unit, SortingOrder: updatedUnit.SortingOrder }
              : unit;
          })
          .sort((a, b) => {
            const orderA = a.SortingOrder || Number.MAX_SAFE_INTEGER;
            const orderB = b.SortingOrder || Number.MAX_SAFE_INTEGER;
            return orderA - orderB || a.UnitID - b.UnitID;
          });

        setUnits(updatedUnits);
        setFilteredUnits(
          updatedUnits.filter(
            (unit) => unit.SubModuleID === submodule.SubModuleID
          )
        );
        setShowUnitOrder(false);
        Swal.fire("Success!", "Unit order has been updated.", "success");
      } else {
        throw new Error(response?.message || "Failed to update unit order");
      }
    } catch (err) {
      console.error("Error updating unit order:", err);
      Swal.fire(
        "Error!",
        `Failed to update unit order: ${err.message}`,
        "error"
      );
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
    const selected = Array.from(e.target.files).map((file) => ({
      file,
      name: file.name,
      customName: file.name,
    }));
    setNewFiles((prevFiles) => [...prevFiles, ...selected]);
  };

  const handleUploadFiles = async () => {
    if (newFiles.length === 0 && fileLink.trim() === "") {
      Swal.fire("Error!", "Please select files or enter a link", "error");
      return;
    }

    setIsUploading(true);
    const uploadToast = Swal.fire({
      title: "Uploading...",
      html: `
      <div class="text-left">
        <div>Preparing to upload ${newFiles.length} file(s)...</div>
        <div class="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div id="upload-progress" class="bg-blue-600 h-2.5 rounded-full" style="width: 0%"></div>
        </div>
        <div id="upload-status" class="text-sm mt-1">Starting upload...</div>
      </div>
    `,
      allowOutsideClick: false,
      showConfirmButton: false,
    });

    try {
      const successfulUploads = [];
      const failedUploads = [];

      // Update progress function
      const updateProgress = (progress, message) => {
        const progressBar = document.getElementById('upload-progress');
        const statusText = document.getElementById('upload-status');
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (statusText) statusText.textContent = message;
      };

      // Upload files sequentially with progress
      for (let i = 0; i < newFiles.length; i++) {
        const fileObj = newFiles[i];
        try {
          updateProgress(
            Math.floor((i / newFiles.length) * 100),
            `Uploading ${i + 1}/${newFiles.length}: ${fileObj.name}...`
          );

          const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf',
            '.doc', '.docx', '.ppt', '.pptx', '.mp4',
            '.mov', '.ipynb', '.py'];
          const fileExt = fileObj.file.name.split('.').pop().toLowerCase();

          if (!allowedExtensions.includes(`.${fileExt}`)) {
            throw new Error(`File type .${fileExt} not allowed`);
          }

          const formData = new FormData();
          formData.append('file', fileObj.file);
          formData.append('moduleId', submodule.ModuleID);
          formData.append('subModuleId', submodule.SubModuleID);
          formData.append('unitId', selectedUnit.UnitID);
          formData.append('customFileName', fileObj.customName || fileObj.file.name);

          const response = await fetch(`${import.meta.env.VITE_API_BASEURL}lms/upload-learning-material-update`, {
            method: 'POST',
            body: formData,
            headers: {
              'auth-token': userToken
            }
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Upload failed');
          }

          const result = await response.json();
          if (result.success) {
            successfulUploads.push({
              name: fileObj.name,
              response: result
            });
          } else {
            throw new Error(result.message || 'Upload failed');
          }
        } catch (fileError) {
          console.error(`Error uploading file ${fileObj.name}:`, fileError);
          failedUploads.push({
            name: fileObj.name,
            error: fileError.message
          });
        }
      }

      // Handle link upload if exists
      if (fileLink.trim()) {
        try {
          updateProgress(95, "Uploading link...");

          const linkResponse = await fetchData(
            "lms/uploadLink",
            "POST",
            {
              unitId: selectedUnit.UnitID,
              link: fileLink,
              fileName: linkName || "Link",
              description: linkDescription || "",
              fileType: "link",
            },
            { "Content-Type": "application/json", "auth-token": userToken }
          );

          if (linkResponse?.success) {
            successfulUploads.push({
              name: linkName || "Link",
              response: linkResponse
            });
          } else {
            throw new Error(linkResponse?.message || 'Link upload failed');
          }
        } catch (linkError) {
          console.error("Error uploading link:", linkError);
          failedUploads.push({
            name: linkName || "Link",
            error: linkError.message
          });
        }
      }

      updateProgress(100, "Finalizing...");

      // Refresh files list
      await fetchFilesForUnit(selectedUnit.UnitID);

      // Prepare result message
      let resultMessage = '';
      if (successfulUploads.length > 0) {
        resultMessage += `<div class="text-green-600 mb-2">
        <strong>Successfully uploaded ${successfulUploads.length} item(s):</strong>
        <ul class="list-disc pl-5 mt-1">
          ${successfulUploads.map(f => `<li>${f.name}</li>`).join('')}
        </ul>
      </div>`;
      }

      if (failedUploads.length > 0) {
        resultMessage += `<div class="text-red-600 mt-3">
        <strong>Failed to upload ${failedUploads.length} item(s):</strong>
        <ul class="list-disc pl-5 mt-1">
          ${failedUploads.map(f => `<li>${f.name}: ${f.error}</li>`).join('')}
        </ul>
      </div>`;
      }

      Swal.fire({
        title: 'Upload Complete',
        html: resultMessage,
        icon: failedUploads.length === 0 ? 'success' :
          successfulUploads.length === 0 ? 'error' : 'warning',
        confirmButtonText: 'OK'
      });

      // Reset form if all uploads succeeded
      if (failedUploads.length === 0) {
        resetForm();
      }
    } catch (err) {
      console.error("Upload error:", err);
      Swal.fire(
        "Error!",
        err.message || "Upload failed",
        "error"
      );
    } finally {
      setIsUploading(false);
      uploadToast.close();
    }
  };
  const resetForm = () => {
    setNewFiles([]);
    setFileLinks([]);
    setFileLink("");
    setLinkName("");
    setLinkDescription("");
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
  };

  const handleDeleteFile = async (fileId) => {
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
        {/* <div className="flex items-center justify-between mb-6">
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
          </h1> 
        </div> */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={handleAddUnitClick}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center"
            >
              <FaEdit className="mr-2" />
              Add New Unit
            </button>
            <button
              onClick={() => setShowUnitOrder(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center"
            >
              Manage Unit Order
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        className={`p-4 cursor-pointer transition-colors duration-200 ${selectedUnit?.UnitID === unit.UnitID
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
                              Upload Files
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
                              {newFiles.length > 0 && (
                                <p className="text-xs text-green-500 mt-2">
                                  {newFiles.length} file(s) selected
                                </p>
                              )}
                            </div>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
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

                          {newFiles.length > 0 && (
                            <div className="space-y-2 mt-4">
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Files to upload:
                              </h4>
                              <div className="max-h-60 overflow-y-auto border rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
                                {newFiles.map((fileObj, index) => (
                                  <div
                                    key={`${fileObj.name}-${index}`}
                                    className="flex flex-col bg-gray-50 dark:bg-gray-700 p-3"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center min-w-0">
                                        <FaFile className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                                          {fileObj.name}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                          ({(fileObj.file.size / 1024).toFixed(2)} KB)
                                        </span>
                                      </div>
                                      <button
                                        onClick={() =>
                                          setNewFiles((prev) => prev.filter((_, i) => i !== index))
                                        }
                                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 ml-2"
                                        title="Remove file"
                                      >
                                        <FaTimes />
                                      </button>
                                    </div>
                                    <div className="mt-2 flex items-center">
                                      <label className="text-xs text-gray-500 dark:text-gray-400 mr-2 whitespace-nowrap">
                                        Display name:
                                      </label>
                                      <input
                                        type="text"
                                        value={fileObj.customName}
                                        onChange={(e) =>
                                          setNewFiles((prev) =>
                                            prev.map((f, i) =>
                                              i === index
                                                ? { ...f, customName: e.target.value }
                                                : f
                                            )
                                          )
                                        }
                                        className="flex-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-1 rounded-md"
                                        placeholder="Custom name (optional)"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                <span>
                                  Total: {newFiles.length} file(s),{' '}
                                  {(newFiles.reduce((acc, file) => acc + file.file.size, 0) / 1024 / 1024).toFixed(2)} MB
                                </span>
                                <button
                                  onClick={() => setNewFiles([])}
                                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs flex items-center"
                                >
                                  <FaTrash className="mr-1" /> Clear all
                                </button>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={handleUploadFiles}
                            disabled={
                              (newFiles.length === 0 &&
                                fileLink.trim() === "") ||
                              isUploading
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
                                {newFiles.length > 0 || fileLink.trim()
                                  ? "Upload Content"
                                  : "Save"}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      {selectedFiles.length > 0 && (
                        <button
                          onClick={() =>
                            handleDeleteMultipleFiles(selectedFiles)
                          }
                          className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          <FaTrash />
                          Delete Selected ({selectedFiles.length})
                        </button>
                      )}
                      <button
                        onClick={() => setShowFilesOrder(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-6"
                        disabled={files.length === 0}
                      >
                        Reorder Files
                      </button>

                      {files.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  <input
                                    type="checkbox"
                                    checked={
                                      selectedFiles.length === files.length &&
                                      files.length > 0
                                    }
                                    onChange={() => {
                                      if (
                                        selectedFiles.length === files.length
                                      ) {
                                        setSelectedFiles([]);
                                      } else {
                                        setSelectedFiles(
                                          files.map((file) => file.FileID)
                                        );
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
                                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${editingFile?.FileID === file.FileID
                                      ? "hidden"
                                      : ""
                                      }`}
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <input
                                        type="checkbox"
                                        checked={selectedFiles.includes(
                                          file.FileID
                                        )}
                                        onChange={() =>
                                          toggleFileSelection(file.FileID)
                                        }
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
                                            handleEditFile(file);
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
                                            handleDeleteFile(file.FileID);
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
                                    <tr className="bg-blue-50 dark:bg-gray-700" key={`edit-row-${file.FileID}`}>
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
                                                  setEditedFileData({
                                                    ...editedFileData,
                                                    fileName: e.target.value,
                                                  })
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
                                                    setEditedFileData({
                                                      ...editedFileData,
                                                      link: e.target.value,
                                                    })
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
                                                value={
                                                  editedFileData.description
                                                }
                                                onChange={(e) =>
                                                  setEditedFileData({
                                                    ...editedFileData,
                                                    description: e.target.value,
                                                  })
                                                }
                                                rows={3}
                                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                              />
                                            </div>
                                          )}

                                          <div className="flex justify-end space-x-3">
                                            <button
                                              onClick={handleCancelEditFile}
                                              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              onClick={handleUpdateFile}
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

      {showUnitOrder && (
        <UnitOrder
          units={filteredUnits}
          onClose={() => setShowUnitOrder(false)}
          onSave={handleSaveUnitOrder}
        />
      )}
      {showFilesOrder && (
        <FilesOrder
          files={files}
          onClose={() => setShowFilesOrder(false)}
          onSave={handleSaveFilesOrder}
        />
      )}
    </div>
  );
};

export default ViewContent;