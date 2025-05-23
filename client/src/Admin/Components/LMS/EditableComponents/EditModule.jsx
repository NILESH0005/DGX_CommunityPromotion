import React, { useState, useContext, useRef } from "react";
import ApiContext from "../../../../context/ApiContext";
import ByteArrayImage from "../../../../utils/ByteArrayImage";
import { compressImage } from "../../../../utils/compressImage";

const EditModule = ({ module, onCancel, onSave, onDelete, onViewSubmodules  }) => {
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
    const fileInputRef = useRef(null);

    const { fetchData, userToken } = useContext(ApiContext);

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
            const compressedImage = await compressImage(file);
            setNewImageFile(compressedImage);

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
        setIsSaving(true);
        setError(null);

        try {
            const payload = {
                ModuleName: editedModule.ModuleName,
                ModuleDescription: editedModule.ModuleDescription,
            };

            let requestBody;
            let headers = {
                'auth-token': userToken
            };

            if (newImageFile) {
                const formData = new FormData();
                formData.append("ModuleName", editedModule.ModuleName);
                formData.append("ModuleDescription", editedModule.ModuleDescription);

                formData.append("ModuleImage", newImageFile);

                requestBody = formData;
            } else if (!imagePreview && module.ModuleImage) {
                payload.ModuleImage = null;
                headers['Content-Type'] = 'application/json';
                requestBody = JSON.stringify(payload);
            } else {
                headers['Content-Type'] = 'application/json';
                requestBody = JSON.stringify(payload);
            }

            const response = await fetchData(
                `lmsEdit/updateModule/${editedModule.ModuleID}`,
                "POST",
                requestBody,
                headers,
            );

            if (response?.success) {
                onSave(response.data);
                setIsEditing(false);
                setIsImageEditing(false);
                setNewImageFile(null);
                setImagePreview(null);
            } else {
                setError(response?.message || "Failed to update module");
            }
        } catch (err) {
            console.error("Error updating module:", err);
            setError(err.message || "An error occurred while updating the module");
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

    const handleDelete = () => {
        onDelete(module.ModuleID);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow max-w-md mx-auto">
            {/* Image Display */}
            <div className="h-64 bg-gray-100 overflow-hidden relative">
                {isImageEditing ? (
                    <div className="h-full flex flex-col items-center justify-center p-4">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-h-48 object-contain mb-4"
                            />
                        ) : module.ModuleImage ? (
                            <ByteArrayImage
                                byteArray={module.ModuleImage.data}
                                className="max-h-48 object-contain mb-4"
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
                            disabled={isCompressing}
                        />
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                disabled={isCompressing}
                            >
                                {isCompressing ? "Processing..." :
                                    (imagePreview ? "Change Image" : "Upload Image")}
                            </button>
                            {(module.ModuleImage || imagePreview) && (
                                <button
                                    type="button"
                                    onClick={handleDeleteImage}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                    disabled={isCompressing}
                                >
                                    Remove Image
                                </button>
                            )}
                        </div>
                        {isCompressing && (
                            <p className="text-sm text-gray-500 mt-2">Compressing image...</p>
                        )}
                    </div>
                ) : module.ModuleImage ? (
                    <>
                        <ByteArrayImage
                            byteArray={module.ModuleImage.data}
                            className="w-full h-full object-cover"
                        />
                        {isEditing && (
                            <button
                                onClick={() => setIsImageEditing(true)}
                                className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow"
                            >
                                ✏️ Edit Image
                            </button>
                        )}
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        {isEditing ? (
                            <div className="text-center">
                                <p className="text-gray-400 mb-2">No Image Available</p>
                                <button
                                    onClick={() => setIsImageEditing(true)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                >
                                    Add Image
                                </button>
                            </div>
                        ) : (
                            <p className="text-gray-400">No Image Available</p>
                        )}
                    </div>
                )}
            </div>

            <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{module.ModuleName}</h3>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="ModuleName"
                            value={editedModule.ModuleName}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            placeholder="Module Name"
                            required
                        />
                        <textarea
                            name="ModuleDescription"
                            value={editedModule.ModuleDescription}
                            onChange={handleChange}
                            rows={5}
                            className="w-full border p-2 rounded"
                            placeholder="Module Description"
                        />
                        {error && <p className="text-red-500">{error}</p>}

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={isSaving || isCompressing}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
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
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <p className="text-gray-600 mb-4">
                            {module.ModuleDescription}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                )}
                {/* Delete Button */}
                <div className="flex justify-end mt-4 space-x-2">
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                        Delete Module
                    </button>
                    <button
                        onClick={() => onViewSubmodules && onViewSubmodules(module)}
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                    >
                        View Submodules
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditModule;