import React, { useState, useContext, useRef, useEffect } from "react";
import ByteArrayImage from "../../../../utils/ByteArrayImage";
import Swal from "sweetalert2";
import ApiContext from "../../../../context/ApiContext";

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
    const fileInputRef = useRef(null);

    const { fetchData, userToken } = useContext(ApiContext);

    // Update local state when module prop changes
    useEffect(() => {
        setEditedModule(module);
        setImagePreview(module.ModuleImage ? `data:image/jpeg;base64,${module.ModuleImage.data}` : null);
        setNewImageFile(null);
    }, [module]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedModule(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match('image.*')) {
            setError("Only image files are allowed");
            return;
        }

        // Validate file size (2MB limit)
        if (file.size > 2 * 1024 * 1024) {
            setError("Image size must be less than 2MB");
            return;
        }

        setError(null);
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        
        // Store the file object
        setNewImageFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const confirmResult = await Swal.fire({
            title: "Confirm Update",
            text: "Are you sure you want to update this module?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, update it",
            cancelButtonText: "Cancel",
        });

        if (!confirmResult.isConfirmed) return;

        setIsSaving(true);
        setError(null);

        // Create FormData for the request
        const formData = new FormData();
        formData.append('ModuleName', editedModule.ModuleName);
        formData.append('ModuleDescription', editedModule.ModuleDescription || '');

        // Handle image cases
        if (newImageFile) {
            formData.append('ModuleImage', newImageFile);
        } else if (imagePreview === null && module.ModuleImage) {
            // Only send removeImage if there was an image before and now it's removed
            formData.append('removeImage', 'true');
        }

        try {
            const response = await fetchData(
                `lmsEdit/updateModule/${editedModule.ModuleID}`,
                "POST",
                formData,
                {
                    "auth-token": userToken,
                    // Don't set Content-Type - let the browser set it with boundary
                },
                false // Indicate we're sending FormData
            );

            if (response?.success) {
                // Update the local state with the new data
                const updatedModule = {
                    ...editedModule,
                    ModuleName: response.data.ModuleName,
                    ModuleDescription: response.data.ModuleDescription,
                    ModuleImage: response.data.ModuleImage || null
                };

                setEditedModule(updatedModule);
                
                // Update image preview based on response
                if (response.data.ModuleImage) {
                    setImagePreview(`data:image/jpeg;base64,${response.data.ModuleImage.data}`);
                } else {
                    setImagePreview(null);
                }

                // Reset editing states
                setIsEditing(false);
                setIsImageEditing(false);
                setNewImageFile(null);

                Swal.fire({
                    title: "Success",
                    text: "Module updated successfully",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                const errorMessage = response?.message || "Failed to update module";
                setError(errorMessage);
                Swal.fire("Error", errorMessage, "error");
            }
        } catch (err) {
            console.error("Error updating module:", err);
            setError(err.message);
            Swal.fire("Error", "Failed to update module", "error");
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

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 max-w-md mx-auto transform hover:-translate-y-1">
            {/* Image Display */}
            <div className="h-64 bg-gray-100 overflow-hidden relative group">
                {isImageEditing ? (
                    <div className="h-full flex flex-col items-center justify-center p-4">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-h-48 object-contain mb-4 transition-opacity duration-300"
                            />
                        ) : editedModule.ModuleImage ? (
                            <ByteArrayImage
                                byteArray={editedModule.ModuleImage.data}
                                className="max-h-48 object-contain mb-4 transition-opacity duration-300"
                            />
                        ) : (
                            <div className="text-gray-400 mb-4">Current Image</div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                            disabled={isSaving}
                        />
                        <div className="flex gap-2 flex-wrap justify-center">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors duration-200 disabled:opacity-50"
                                disabled={isSaving}
                            >
                                {imagePreview ? "Change Image" : "Upload Image"}
                            </button>
                            {(editedModule.ModuleImage || imagePreview) && (
                                <button
                                    type="button"
                                    onClick={handleDeleteImage}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition-colors duration-200 disabled:opacity-50"
                                    disabled={isSaving}
                                >
                                    Remove Image
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleCancelImageEdit}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm transition-colors duration-200"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : editedModule.ModuleImage || imagePreview ? (
                    <>
                        <img
                            src={imagePreview || `data:image/jpeg;base64,${editedModule.ModuleImage.data}`}
                            alt="Module"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {isEditing && (
                            <button
                                onClick={() => setIsImageEditing(true)}
                                className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow transition-all duration-200 hover:scale-110"
                                title="Edit Image"
                            >
                                ✏️
                            </button>
                        )}
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        {isEditing ? (
                            <div className="text-center p-4">
                                <p className="text-gray-500 mb-3">No Image Available</p>
                                <button
                                    onClick={() => setIsImageEditing(true)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors duration-200 shadow-md hover:shadow-lg"
                                >
                                    Add Image
                                </button>
                            </div>
                        ) : (
                            <p className="text-gray-500">No Image Available</p>
                        )}
                    </div>
                )}
            </div>

            <div className="p-6">
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="ModuleName" className="block text-sm font-medium text-gray-700 mb-1">
                                Module Name
                            </label>
                            <input
                                type="text"
                                id="ModuleName"
                                name="ModuleName"
                                value={editedModule.ModuleName}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="Module Name"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="ModuleDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="ModuleDescription"
                                name="ModuleDescription"
                                value={editedModule.ModuleDescription}
                                onChange={handleChange}
                                rows={5}
                                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="Module Description"
                            />
                        </div>
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-2 flex-wrap">
                            <button
                                type="submit"
                                disabled={isSaving}
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
                                ) : "Save Changes"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setIsImageEditing(false);
                                    setNewImageFile(null);
                                    setImagePreview(
                                        module.ModuleImage ? `data:image/jpeg;base64,${module.ModuleImage.data}` : null
                                    );
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">{editedModule.ModuleName}</h3>
                        <p className="text-gray-600 mb-4 whitespace-pre-line">
                            {editedModule.ModuleDescription || "No description provided"}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </button>
                        </div>
                    </div>
                )}
                {/* Action Buttons */}
                <div className="flex justify-end mt-4 space-x-2 flex-wrap">
                    <button
                        onClick={() => onDelete(editedModule.ModuleID)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Module
                    </button>
                    {onViewSubmodules && (
                        <button
                            onClick={() => onViewSubmodules(editedModule)}
                            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors duration-200 text-sm flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            View Submodules
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditModule;