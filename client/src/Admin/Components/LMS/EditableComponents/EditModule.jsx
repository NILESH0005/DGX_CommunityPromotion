import React, { useState, useContext, useRef, useEffect } from "react";
import ByteArrayImage from "../../../../utils/ByteArrayImage";
import { compressImage } from "../../../../utils/compressImage";
import Swal from "sweetalert2";
import ApiContext from "../../../../context/ApiContext";
import { FaEdit, FaTrash, FaFolder, FaSave, FaTimes, FaUpload, FaImage, FaEllipsisH, FaAngleDown, FaAngleUp } from "react-icons/fa";
import { Tooltip as ReactTooltip } from "react-tooltip";

const EditModule = ({ module, onCancel, onDelete, onViewSubmodules }) => {
    const [editedModule, setEditedModule] = useState(module);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isImageEditing, setIsImageEditing] = useState(false);
    const [newImageFile, setNewImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(
        module.ModuleImage ? `data:image/jpeg;base64,${module.ModuleImage.data}` : null
    );
    const [isCompressing, setIsCompressing] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const descriptionRef = useRef(null);
    const [isDescriptionClamped, setIsDescriptionClamped] = useState(false);

    const { fetchData, userToken } = useContext(ApiContext);

    useEffect(() => {
        setEditedModule(module);
        setImagePreview(module.ModuleImage ? `data:image/jpeg;base64,${module.ModuleImage.data}` : null);
    }, [module]);

    useEffect(() => {
        if (textareaRef.current && isEditing) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 100)}px`;
        }
    }, [editedModule.ModuleDescription, isEditing]);

    useEffect(() => {
        // Check if description needs clamping
        if (descriptionRef.current && !isEditing) {
            const element = descriptionRef.current;
            setIsDescriptionClamped(element.scrollHeight > element.clientHeight);
        }
    }, [editedModule.ModuleDescription, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedModule(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            if (!file.type.match('image.*')) {
                setError("Only image files are allowed");
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setError("Image size must be less than 2MB");
                return;
            }

            setIsCompressing(true);
            setError(null);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);

            // Convert to base64 string
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1]; // Remove data URL prefix
                setNewImageFile(base64String);
            };
            reader.readAsDataURL(file);

        } catch (error) {
            console.error("Image processing error:", error);
            setError("Failed to process image");
            setImagePreview(null);
            setNewImageFile(null);
        } finally {
            setIsCompressing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const confirmResult = await Swal.fire({
            title: "Confirm Update",
            text: "Are you sure you want to update this module?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "Cancel",
        });

        if (!confirmResult.isConfirmed) return;

        setIsSaving(true);
        setError(null);
        const payload = {
            ModuleID: editedModule.ModuleID,
            ModuleName: editedModule.ModuleName,
            ModuleDescription: editedModule.ModuleDescription,
        };
        if (newImageFile) {
            payload.ModuleImage = {
                data: newImageFile,
                contentType: 'image/jpeg'
            };
        } else if (!imagePreview && editedModule.ModuleImage) {
            payload.ModuleImage = null;
        }

        const headers = {
            "Content-Type": "application/json",
            "auth-token": userToken,
        };

        try {
            const response = await fetchData(
                `lmsEdit/updateModule/${editedModule.ModuleID}`,
                "POST",
                payload,
                headers
            );

            if (response?.success) {
                const updatedModule = {
                    ...editedModule,
                    ...response.data,
                    ModuleName: response.data.ModuleName,
                    ModuleDescription: response.data.ModuleDescription,
                    ModuleImage: response.data.ModuleImage || null
                };

                setEditedModule(updatedModule);

                if (response.data.ModuleImage) {
                    setImagePreview(`data:image/jpeg;base64,${response.data.ModuleImage.data}`);
                } else {
                    setImagePreview(null);
                }

                setIsEditing(false);
                setIsImageEditing(false);
                setNewImageFile(null);
                setShowFullDescription(false);



                Swal.fire({
                    title: "Success",
                    text: "Module updated successfully",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                throw new Error(response?.message || "Failed to update module");
            }
        } catch (err) {
            console.error("Error updating module:", err);
            setError(err.message);
            Swal.fire("Error", err.message, "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelImageEdit = () => {
        setIsImageEditing(false);
        setNewImageFile(null);
        setImagePreview(module.ModuleImage ? `data:image/jpeg;base64,${module.ModuleImage.data}` : null);
    };

    const handleDeleteImage = () => {
        setNewImageFile(null);
        setImagePreview(null);
    };

    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };

    const resetForm = () => {
        setEditedModule(module);
        setIsEditing(false);
        setIsImageEditing(false);
        setNewImageFile(null);
        setImagePreview(module.ModuleImage ?
            (typeof module.ModuleImage === 'string' ?
                `data:image/jpeg;base64,${module.ModuleImage}` :
                `data:image/jpeg;base64,${module.ModuleImage.data}`
            ) : null
        );
        setError(null);
        setShowFullDescription(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 w-full border border-gray-200 dark:border-gray-700 flex flex-col h-full">
            {/* Image Section - Fixed height */}
            <div className="h-48 bg-gradient-to-r from-white-500 to-white-700 overflow-hidden relative group">
                {isImageEditing ? (
                    <div className="h-full flex flex-col items-center justify-center p-4 bg-black bg-opacity-70">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-h-32 object-contain mb-4 transition-opacity duration-300"
                            />
                        ) : editedModule.ModuleImage ? (
                            typeof editedModule.ModuleImage === 'string' ? (
                                <img
                                    src={`data:image/jpeg;base64,${editedModule.ModuleImage.data}`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    alt="Module"
                                />
                            ) : editedModule.ModuleImage.data ? (
                                <ByteArrayImage
                                    byteArray={editedModule.ModuleImage.data}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                            ) : null
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
                            {(editedModule.ModuleImage || imagePreview) && (
                                <button
                                    type="button"
                                    onClick={handleDeleteImage}
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs transition-colors duration-200 disabled:opacity-50 flex items-center"
                                    disabled={isCompressing || isSaving}
                                >
                                    <FaTrash className="mr-1" />
                                    Remove
                                </button>
                            )}
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
                ) : editedModule.ModuleImage ? (
                    <>
                        <ByteArrayImage
                            byteArray={editedModule.ModuleImage.data}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        {isEditing && (
                            <button
                                onClick={() => setIsImageEditing(true)}
                                className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow transition-all duration-200 hover:scale-110"
                                data-tooltip-id="edit-image-tooltip"
                                data-tooltip-content="Edit Image"
                            >
                                <FaEdit size={14} />
                            </button>
                        )}
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center bg-gradient-to-br from-white-600 to-white-800">
                        {isEditing ? (
                            <div className="text-center p-4">
                                <p className="text-black-200 mb-3 text-sm">No Image Available</p>
                                <button
                                    onClick={() => setIsImageEditing(true)}
                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs transition-colors duration-200 shadow-md hover:shadow-lg flex items-center mx-auto"
                                >
                                    <FaImage className="mr-1" />
                                    Add Image
                                </button>
                            </div>
                        ) : (
                            <p className="text-Black-200">No Image Available</p>
                        )}
                    </div>
                )}
            </div>

            {/* Content Section - Flex-grow to take remaining space */}
            <div className="p-4 sm:p-6 flex-grow flex flex-col">
                <div className="flex-grow">
                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-4 h-full flex flex-col">
                            <div>
                                <label htmlFor="ModuleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Module Name
                                </label>
                                <input
                                    type="text"
                                    id="ModuleName"
                                    name="ModuleName"
                                    value={editedModule.ModuleName}
                                    onChange={handleChange}
                                    className="w-full border border-DGXgreen dark:border-DGXgreen dark:bg-DGXblue dark:text-DGXwhite p-2 rounded-md focus:ring-2 focus:ring-DGXgreen focus:border-DGXgreen transition-all duration-200"
                                    placeholder="Module Name"
                                    required
                                />
                            </div>
                            <div className="flex-grow">
                                <label htmlFor="ModuleDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    ref={textareaRef}
                                    id="ModuleDescription"
                                    name="ModuleDescription"
                                    value={editedModule.ModuleDescription}
                                    onChange={handleChange}
                                    className="w-full border border-DGXgreen dark:border-DGXgreen dark:bg-DGXblue dark:text-DGXwhite p-2 rounded-md focus:ring-2 focus:ring-DGXgreen focus:border-DGXgreen transition-all duration-200 flex-grow"
                                    placeholder="Module Description"
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
                                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 flex items-center justify-center min-w-32 disabled:opacity-50"
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
                                    onClick={() => {
                                        { resetForm }
                                        setIsEditing(false);
                                        setIsImageEditing(false);
                                        setNewImageFile(null);
                                        setImagePreview(
                                            editedModule.ModuleImage ? `data:image/jpeg;base64,${editedModule.ModuleImage.data}` : null
                                        );
                                    }}
                                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200 flex items-center"
                                >
                                    <FaTimes className="mr-2" />
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                                {editedModule.ModuleName}
                            </h3>
                            <div className="prose dark:prose-invert max-w-none mb-2">
                                <div
                                    ref={descriptionRef}
                                    className={`text-gray-600 dark:text-gray-300 whitespace-pre-line text-sm sm:text-base ${!showFullDescription ? 'line-clamp-3' : ''
                                        }`}
                                >
                                    {editedModule.ModuleDescription || "No description provided"}
                                </div>
                                {(isDescriptionClamped || showFullDescription) && (
                                    <button
                                        onClick={toggleDescription}
                                        className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm mt-1 flex items-center"
                                    >
                                        {showFullDescription ? (
                                            <>
                                                <FaAngleUp className="mr-1" />
                                                Show Less
                                            </>
                                        ) : (
                                            <>
                                                <FaAngleDown className="mr-1" />
                                                Read More
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Action Buttons - Fixed at the bottom */}
                {!isEditing && (
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
                            data-tooltip-id="edit-tooltip"
                            data-tooltip-content="Edit Module"
                        >
                            <FaEdit size={14} />
                        </button>
                        <button
                            onClick={() => onDelete(editedModule.ModuleID)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                            data-tooltip-id="delete-tooltip"
                            data-tooltip-content="Delete Module"
                        >
                            <FaTrash size={14} />
                        </button>
                        {onViewSubmodules && (
                            <button
                                onClick={() => onViewSubmodules(editedModule)}
                                className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center"
                                data-tooltip-id="submodules-tooltip"
                                data-tooltip-content="View Submodules"
                            >
                                <FaFolder size={14} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Tooltips */}
            <ReactTooltip id="edit-tooltip" place="top" effect="solid" />
            <ReactTooltip id="delete-tooltip" place="top" effect="solid" />
            <ReactTooltip id="submodules-tooltip" place="top" effect="solid" />
            <ReactTooltip id="edit-image-tooltip" place="top" effect="solid" />
        </div>
    );
};

export default EditModule;