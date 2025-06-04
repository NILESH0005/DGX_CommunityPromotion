import React, { useState, useEffect, useContext, useRef } from "react";
import ApiContext from "../../../../context/ApiContext";
import ByteArrayImage from "../../../../utils/ByteArrayImage";
import { compressImage } from "../../../../utils/compressImage";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import ViewContent from "./ViewContent";
import AddSubmodulePopup from "./AddSubmodulePopup";
import { FaEdit, FaTrash, FaFolder, FaSave, FaTimes, FaUpload, FaImage, FaChevronRight, FaPlus } from "react-icons/fa";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { Link } from "react-router-dom";
import CreateQuiz from "../../Quiz/CreateQuiz";

const EditSubModule = ({ module, onBack }) => {
    const [viewingContent, setViewingContent] = useState(null);
    const [submodules, setSubmodules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingSubmodule, setEditingSubmodule] = useState(null);
    const [showAddSubmodulePopup, setShowAddSubmodulePopup] = useState(false);
    const [showCreateQuiz, setShowCreateQuiz] = useState(false);
    const [quizSubmodule, setQuizSubmodule] = useState(null);
    const [editedData, setEditedData] = useState({
        SubModuleName: '',
        SubModuleDescription: '',
        SubModuleImage: null,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isImageEditing, setIsImageEditing] = useState(false);
    const [newImageFile, setNewImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    const { fetchData, userToken } = useContext(ApiContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubmodules = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log("Fetching submodules for module ID:", module.ModuleID);

                const response = await fetchData(
                    `dropdown/getSubModules?moduleId=${module.ModuleID}`,
                    "GET",
                    { 'auth-token': userToken }
                );

                if (!response) throw new Error("No response received");
                if (response?.success) {
                    const filtered = Array.isArray(response.data)
                        ? response.data.filter(sub => sub.ModuleID === module.ModuleID)
                        : [];
                    setSubmodules(filtered);
                } else {
                    setError(response?.message || "Failed to fetch submodules");
                }
            } catch (err) {
                console.error("Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmodules();
    }, [module.ModuleID, fetchData, userToken]);

    useEffect(() => {
        if (textareaRef.current && isEditing) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 100)}px`;
        }
    }, [editedData.SubModuleDescription, isEditing]);

    const handleDeleteSubmodule = async (SubModuleID) => {
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
            const response = await fetchData(
                "lmsEdit/deleteSubModule",
                "POST",
                { subModuleId: Number(SubModuleID) },
                {
                    "Content-Type": "application/json",
                    "auth-token": userToken
                }
            );

            if (response?.success) {
                setSubmodules(prev => prev.filter(sub => sub.SubModuleID !== SubModuleID));
                Swal.fire('Deleted!', 'Submodule has been deleted.', 'success');
            } else {
                throw new Error(response?.message || "Failed to delete submodule");
            }
        } catch (err) {
            console.error("Delete error:", err);
            Swal.fire('Error!', `Failed to delete submodule: ${err.message}`, 'error');
        }
    };

    const handleAddSubmodule = () => {
        setShowAddSubmodulePopup(true);
    };

    const handleSaveSubmodule = async (moduleId, formData) => {
        try {
            const headers = { 'auth-token': userToken };
            let payload;
            let isMultipart = false;

            if (formData.SubModuleImage) {
                const formDataPayload = new FormData();
                formDataPayload.append("ModuleID", moduleId);
                formDataPayload.append("SubModuleName", formData.SubModuleName);
                formDataPayload.append("SubModuleDescription", formData.SubModuleDescription || "");
                formDataPayload.append("SubModuleImage", formData.SubModuleImage);
                payload = formDataPayload;
                isMultipart = true;
            } else {
                headers['Content-Type'] = 'application/json';
                payload = {
                    ModuleID: moduleId,
                    SubModuleName: formData.SubModuleName,
                    SubModuleDescription: formData.SubModuleDescription || ""
                };
            }

            const response = await fetchData(
                "lmsEdit/addSubModule",
                "POST",
                payload,
                headers,
                isMultipart
            );

            if (response?.success) {
                setSubmodules(prev => [...prev, response.data]);
                Swal.fire('Success!', 'Submodule added successfully', 'success');
            } else {
                throw new Error(response?.message || "Failed to add submodule");
            }
        } catch (err) {
            console.error("Error:", err);
            throw err;
        }
    };

    const handleEditSubmoduleInit = (submodule) => {
        setEditingSubmodule(submodule);
        setEditedData({
            SubModuleName: submodule.SubModuleName,
            SubModuleDescription: submodule.SubModuleDescription || '',
            SubModuleImage: submodule.SubModuleImage
        });

        // Handle image preview initialization
        if (submodule.SubModuleImage?.data) {
            if (Array.isArray(submodule.SubModuleImage.data)) {
                const byteArray = new Uint8Array(submodule.SubModuleImage.data);
                let binary = '';
                byteArray.forEach(byte => binary += String.fromCharCode(byte));
                const base64String = btoa(binary);
                setImagePreview(`data:${submodule.SubModuleImage.contentType || 'image/jpeg'};base64,${base64String}`);
            } else if (typeof submodule.SubModuleImage.data === 'string') {
                setImagePreview(`data:${submodule.SubModuleImage.contentType || 'image/jpeg'};base64,${submodule.SubModuleImage.data}`);
            }
        }

        else {
            setImagePreview(null);
        }

        setIsEditing(true);
        setIsImageEditing(false);
        setNewImageFile(null);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingSubmodule(null);
        setEditedData({});
        setImagePreview(null);
        setNewImageFile(null);
        setIsImageEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            if (!file.type.match('image.*')) {
                throw new Error("Only image files are allowed");
            }

            if (file.size > 2 * 1024 * 1024) {
                throw new Error("Image size must be less than 2MB");
            }

            setIsCompressing(true);
            setError(null);

            // Create preview
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);

            // Compress image and keep as File object for FormData
            const compressedImage = await compressImage(file);
            setNewImageFile(compressedImage);

        } catch (error) {
            console.error("Image processing error:", error);
            setError(error.message);
            setImagePreview(null);
            setNewImageFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } finally {
            setIsCompressing(false);
        }
    };

    const handleCancelImageEdit = () => {
        setIsImageEditing(false);
        setNewImageFile(null);
        setImagePreview(
            editingSubmodule?.SubModuleImage && editingSubmodule.SubModuleImage.data
                ? `data:image/jpeg;base64,${editingSubmodule.SubModuleImage.data}`
                : null
        );
    };

    const handleDeleteImage = () => {
        setNewImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            if (!editedData.SubModuleName?.trim()) {
                throw new Error("Submodule name is required");
            }

            const confirmResult = await Swal.fire({
                title: "Confirm Update",
                text: "Are you sure you want to update this submodule?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: "Cancel",
            });

            if (!confirmResult.isConfirmed) {
                setIsSaving(false);
                return;
            }

            const payload = {
                SubModuleName: editedData.SubModuleName,
                SubModuleDescription: editedData.SubModuleDescription || "",
                SubModuleImage: newImageFile ? newImageFile : null,
            };

            const headers = {
                "auth-token": userToken,
                "Content-Type": "application/json",
            };

            const response = await fetchData(
                `lmsEdit/updateSubModule/${editingSubmodule.SubModuleID}`,
                "POST",
                payload,
                headers
            );
            console.log("Image payload test:", response);

            if (!response?.success) {
                throw new Error(response?.message || "Failed to update submodule");
            }
            console.log("Test 2:", response.data.SubModuleImage.data);
            const updatedSubmodule = {
                ...editingSubmodule,
                SubModuleName: response.data.SubModuleName,
                SubModuleDescription: response.data.SubModuleDescription,
                SubModuleImage: response.data.SubModuleImage.data
            };
            setSubmodules(prev =>
                prev.map(sub =>
                    sub.SubModuleID === updatedSubmodule.SubModuleID
                        ? updatedSubmodule
                        : sub
                )
            );
            setIsEditing(false);
            setEditingSubmodule(null);
            setEditedData({});
            setImagePreview(null);
            setNewImageFile(null);

            await Swal.fire({
                title: "Success",
                text: "Submodule updated successfully",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });

        } catch (err) {
            console.error("Error updating submodule:", err);
            setError(err.message);
            await Swal.fire("Error", err.message, "error");
        } finally {
            setIsSaving(false);
        }
    };
    const handleCreateQuiz = (submoduleId, submoduleName) => {
        setQuizSubmodule({ id: submoduleId, name: submoduleName });
        setShowCreateQuiz(true);
    };

    const handleBackFromQuiz = () => {
        setShowCreateQuiz(false);
        setQuizSubmodule(null);
    };

    const navigateToQuizTable = () => {
        // Implement navigation to quiz table if needed
        // For now, just go back to submodules list
        handleBackFromQuiz();
    };

    const handleViewContent = (submodule) => {
        setViewingContent(submodule);
    };

    const handleBackToSubmodules = () => {
        setViewingContent(null);
    };

    if (loading) {
        return <div className="text-center py-10">Loading submodules...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                    Back to Modules
                </button>
            </div>
        );
    }

    if (viewingContent) {
        return (
            <ViewContent
                submodule={viewingContent}
                onBack={handleBackToSubmodules}
            />
        );
    }

    if (showCreateQuiz && quizSubmodule) {
        return (
            <CreateQuiz
                moduleId={quizSubmodule.id}
                moduleName={quizSubmodule.name}
                navigateToQuizTable={navigateToQuizTable}
                onBack={handleBackFromQuiz}
                isSubmodule={true}  // Add this prop to distinguish between module and submodule
            />
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <button
                            onClick={onBack}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center mt-1"
                        >
                            <FaChevronRight className="mr-1 text-xs" />
                            {module.ModuleName}
                        </button>
                    </div>
                    {/* <h1 className="text-2xl font-bold text-gray-800 dark:text-Black">
                        Submodules for: <span className="text-red-600 dark:text-red-400">{module.ModuleName}</span>
                    </h1> */}
                    <button
                        onClick={handleAddSubmodule}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center"
                    >
                        <FaEdit className="mr-2" />
                        Add New Submodule
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {submodules.length > 0 ? (
                        submodules.map((submodule) => (
                            <div
                                key={submodule.SubModuleID}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 w-full border border-gray-200 dark:border-gray-700"
                            >
                                {/* Image Section */}
                                <div className="h-40 sm:h-48 bg-gradient-to-r from-red-500 to-red-700 overflow-hidden relative group">
                                    {isEditing && editingSubmodule?.SubModuleID === submodule.SubModuleID && isImageEditing ? (
                                        <div className="h-full flex flex-col items-center justify-center p-4 bg-black bg-opacity-70">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="max-h-24 sm:max-h-32 object-contain mb-4 transition-opacity duration-300"
                                                />
                                            ) : submodule.SubModuleImage?.data ? (
                                                <ByteArrayImage
                                                    byteArray={submodule.SubModuleImage.data}
                                                    className="max-h-24 sm:max-h-32 object-contain mb-4 transition-opacity duration-300"
                                                />
                                            ) : (
                                                <div className="text-gray-300 mb-4">No Image</div>
                                            )}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageChange}
                                                accept="image/*"
                                                className="hidden"
                                                disabled={isCompressing || isSaving}
                                            />
                                            <div className="flex gap-2 flex-wrap justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current.click()}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs transition-colors duration-200 disabled:opacity-50 flex items-center"
                                                    disabled={isCompressing || isSaving}
                                                >
                                                    <FaUpload className="mr-1" />
                                                    {isCompressing ? "Processing..." : (imagePreview ? "Change" : "Upload")}
                                                </button>
                                                {/* {(submodule.SubModuleImage || imagePreview) && (
                                                    <button
                                                        type="button"
                                                        onClick={handleDeleteImage}
                                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs transition-colors duration-200 disabled:opacity-50 flex items-center"
                                                        disabled={isCompressing || isSaving}
                                                    >
                                                        <FaTrash className="mr-1" />
                                                        Remove
                                                    </button>
                                                )} */}
                                                <button
                                                    type="button"
                                                    onClick={handleCancelImageEdit}
                                                    className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 text-xs transition-colors duration-200 flex items-center"
                                                    disabled={isCompressing || isSaving}
                                                >
                                                    <FaTimes className="mr-1" />
                                                    Cancel
                                                </button>
                                            </div>
                                            {isCompressing && (
                                                <p className="text-xs text-gray-300 mt-2 animate-pulse">Compressing image...</p>
                                            )}
                                        </div>
                                    ) : isEditing && editingSubmodule?.SubModuleID === submodule.SubModuleID ? (
                                        <>
                                            {submodule.SubModuleImage?.data ? (
                                                typeof submodule.SubModuleImage.data === 'string' ? (
                                                    <img
                                                        src={`data:${submodule.SubModuleImage.contentType || 'image/jpeg'};base64,${submodule.SubModuleImage.data}`}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                        alt="Submodule"
                                                    />
                                                ) : (
                                                    <ByteArrayImage
                                                        byteArray={submodule.SubModuleImage.data}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                    />
                                                )
                                            ) : (
                                                <div className="h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-red-800">
                                                    <div className="text-center p-4">
                                                        <p className="text-gray-200 mb-3 text-sm">No Image Available</p>
                                                        <button
                                                            onClick={() => setIsImageEditing(true)}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs transition-colors duration-200 shadow-md hover:shadow-lg flex items-center mx-auto"
                                                        >
                                                            <FaImage className="mr-1" />
                                                            Add Image
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setIsImageEditing(true)}
                                                className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow transition-all duration-200 hover:scale-110"
                                                data-tooltip-id="edit-image-tooltip"
                                                data-tooltip-content="Edit Image"
                                            >
                                                <FaEdit size={14} />
                                            </button>
                                        </>
                                    ) : submodule.SubModuleImage?.data ? (
                                        typeof submodule.SubModuleImage.data === 'string' ? (
                                            <img
                                                src={`data:${submodule.SubModuleImage.contentType || 'image/jpeg'};base64,${submodule.SubModuleImage.data}`}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                alt="Submodule"
                                            />
                                        ) : (
                                            <ByteArrayImage
                                                byteArray={submodule.SubModuleImage.data}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                        )
                                    ) : (
                                        <div className="h-full flex items-center justify-center bg-gradient-to-br from-red-600 to-red-800">
                                            <p className="text-gray-200">No Image Available</p>
                                        </div>
                                    )}
                                </div>

                                {/* Content Section */}
                                <div className="p-4 sm:p-6">
                                    {isEditing && editingSubmodule?.SubModuleID === submodule.SubModuleID ? (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label htmlFor="SubModuleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Submodule Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="SubModuleName"
                                                    name="SubModuleName"
                                                    value={editedData.SubModuleName || ''}
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                                                    placeholder="Submodule Name"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="SubModuleDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Description
                                                </label>
                                                <textarea
                                                    ref={textareaRef}
                                                    id="SubModuleDescription"
                                                    name="SubModuleDescription"
                                                    value={editedData.SubModuleDescription || ''}
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                                                    placeholder="Submodule Description"
                                                    style={{ minHeight: '100px' }}
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
                                                    disabled={isSaving || isCompressing}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center justify-center min-w-32 disabled:opacity-50"
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                                                    onClick={handleCancelEdit}
                                                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200 flex items-center"
                                                >
                                                    <FaTimes className="mr-2" />
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2">
                                                {submodule.SubModuleName}
                                            </h3>
                                            <div className="prose dark:prose-invert max-w-none">
                                                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line text-sm sm:text-base">
                                                    {submodule.SubModuleDescription || "No description provided"}
                                                </p>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex justify-end gap-2 mt-4 sm:mt-6">
                                                <button
                                                    onClick={() => handleCreateQuiz(submodule.SubModuleID, submodule.SubModuleName)}
                                                    className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-200"
                                                    data-tooltip-id="create-quiz-tooltip"
                                                    data-tooltip-content="Create Quiz"
                                                >
                                                    <FaPlus size={14} className="sm:size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditSubmoduleInit(submodule)}
                                                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200"
                                                    data-tooltip-id="edit-tooltip"
                                                    data-tooltip-content="Edit Submodule"
                                                >
                                                    <FaEdit size={14} className="sm:size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSubmodule(submodule.SubModuleID)}
                                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                                                    data-tooltip-id="delete-tooltip"
                                                    data-tooltip-content="Delete Submodule"
                                                >
                                                    <FaTrash size={14} className="sm:size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleViewContent(submodule)}
                                                    className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors duration-200"
                                                    data-tooltip-id="view-content-tooltip"
                                                    data-tooltip-content="View Content"
                                                >
                                                    <FaFolder size={14} className="sm:size-4" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-600 dark:text-gray-300">No submodules found for this module</p>
                            <button
                                onClick={handleAddSubmodule}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center mx-auto"
                            >
                                <FaEdit className="mr-2" />
                                Add New Submodule
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tooltips */}
            <ReactTooltip id="edit-tooltip" place="top" effect="solid" />
            <ReactTooltip id="delete-tooltip" place="top" effect="solid" />
            <ReactTooltip id="view-content-tooltip" place="top" effect="solid" />
            <ReactTooltip id="edit-image-tooltip" place="top" effect="solid" />

            {showAddSubmodulePopup && (
                <AddSubmodulePopup
                    moduleId={module.ModuleID}
                    onClose={() => setShowAddSubmodulePopup(false)}
                    onSave={handleSaveSubmodule}
                />
            )}
        </div>
    );
};

export default EditSubModule;