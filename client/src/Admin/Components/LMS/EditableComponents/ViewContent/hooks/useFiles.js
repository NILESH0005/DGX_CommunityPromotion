import { useState, useRef, useCallback, useEffect } from "react";
import Swal from "sweetalert2";

export const useFiles = (fetchData, userToken, selectedUnit) => {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [fileLink, setFileLink] = useState("");
  const [linkName, setLinkName] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [editedFileData, setEditedFileData] = useState({
    fileName: "",
    description: "",
    link: "",
  });

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
    if (selectedUnit) {
      fetchFilesForUnit(selectedUnit.UnitID);
    }
  }, [selectedUnit, fetchFilesForUnit]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).map((file) => ({
      file,
      name: file.name,
      customName: file.name,
    }));
    setNewFiles((prevFiles) => [...prevFiles, ...selected]);
  };

  const resetForm = () => {
    setNewFiles([]);
    setFileLink("");
    setLinkName("");
    setLinkDescription("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadFiles = async () => {
    if (newFiles.length === 0 && fileLink.trim() === "") {
      Swal.fire("Error!", "Please select files or enter a link", "error");
      return;
    }

    setIsUploading(true);
    const uploadToast = Swal.fire({
      title: "Uploading...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const uploadResponses = await Promise.all([
        ...newFiles.map(fileObj => {
          const formData = new FormData();
          formData.append("file", fileObj.file);
          formData.append("unitId", selectedUnit.UnitID);
          formData.append("fileName", fileObj.customName);
          formData.append("description", "");

          return fetch(`${import.meta.env.VITE_API_BASEURL}lms/uploadFile`, {
            method: "POST",
            body: formData,
            headers: { "auth-token": userToken },
          }).then(res => res.json());
        }),
        ...(fileLink.trim() ? [
          fetchData(
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
          )
        ] : [])
      ]);

      const successfulUploads = uploadResponses.filter(r => r?.success);

      if (successfulUploads.length > 0) {
        const updatedFiles = await fetchData(
          `lmsEdit/getFiles?unitId=${selectedUnit.UnitID}`,
          "GET",
          null,
          { "auth-token": userToken }
        );

        if (updatedFiles?.success) {
          setFiles(updatedFiles.data);
          Swal.fire("Success!", "Files uploaded successfully", "success");
        } else {
          throw new Error("Failed to refresh files list");
        }
      } else {
        throw new Error(uploadResponses.find(r => r?.error)?.error || "Upload failed");
      }

      resetForm();
    } catch (err) {
      console.error("Upload error:", err);
      Swal.fire("Error!", err.message || "Upload failed", "error");
    } finally {
      setIsUploading(false);
      uploadToast.close();
    }
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
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
      setFiles((prev) => prev.filter((file) => !fileIds.includes(file.FileID)));
      setSelectedFiles([]);

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
      const equalPercentage = (100 / orderedFiles.length).toFixed(2);
      const filesWithOrder = orderedFiles.map((file, index) => ({
        FileID: file.FileID,
        Percentage: equalPercentage,
        SortingOrder: index + 1,
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

  return {
    files,
    fileInputRef,
    selectedFiles,
    newFiles,
    fileLink,
    linkName,
    linkDescription,
    isUploading,
    editingFile,
    editedFileData,
    setFileLink,
    setLinkName,
    setLinkDescription,
    setEditedFileData,
    handleFileChange,
    handleUploadFiles,
    toggleFileSelection,
    handleEditFile,
    handleCancelEditFile,
    handleUpdateFile,
    handleDeleteFile,
    handleDeleteMultipleFiles,
    handleSaveFilesOrder,
    resetForm,
  };
};