import React, { useState, useEffect, useContext, useRef } from "react";
import ApiContext from "../../../../context/ApiContext";
import ByteArrayImage from "../../../../utils/ByteArrayImage";
import { compressImage } from "../../../../utils/compressImage";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import ViewContent from "./ViewContent";

const EditSubModule = ({ module, onBack }) => {
    const [viewingContent, setViewingContent] = useState(null);
    const [submodules, setSubmodules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingSubmodule, setEditingSubmodule] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [isImageEditing, setIsImageEditing] = useState(false);
    const [newImageFile, setNewImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const fileInputRef = useRef(null);

    const { fetchData, userToken } = useContext(ApiContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubmodules = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetchData(
                    `dropdown/getSubModules`,
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

    const handleEditSubmodule = (submodule) => {
        setEditingSubmodule(submodule);
        setEditedData({
            SubModuleName: submodule.SubModuleName,
            SubModuleDescription: submodule.SubModuleDescription,
            Duration: submodule.Duration
        });
        setImagePreview(
            submodule.SubModuleImage
                ? `data:image/jpeg;base64,${submodule.SubModuleImage.data}`
                : null
        );
    };

    const handleCancelEdit = () => {
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

    const handleDeleteImage = () => {
        setNewImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const payload = {
                SubModuleName: editedData.SubModuleName,
                SubModuleDescription: editedData.SubModuleDescription,
                Duration: editedData.Duration,
                ModuleID: module.ModuleID
            };

            let requestBody;
            let headers = { 'auth-token': userToken };

            if (newImageFile) {
                const formData = new FormData();
                Object.entries(payload).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                formData.append("SubModuleImage", newImageFile);
                requestBody = formData;
            } else if (!imagePreview && editingSubmodule?.SubModuleImage) {
                payload.SubModuleImage = null;
                headers['Content-Type'] = 'application/json';
                requestBody = JSON.stringify(payload);
            } else {
                headers['Content-Type'] = 'application/json';
                requestBody = JSON.stringify(payload);
            }

            const response = await fetchData(
                `lmsEdit/updateSubModule/${editingSubmodule.SubModuleID}`,
                "POST",
                requestBody,
                headers,
                !!newImageFile
            );

            if (response?.success) {
                setSubmodules(prev => prev.map(sub =>
                    sub.SubModuleID === editingSubmodule.SubModuleID
                        ? response.data
                        : sub
                ));
                handleCancelEdit();
                Swal.fire('Success!', 'Submodule updated successfully', 'success');
            } else {
                throw new Error(response?.message || "Failed to update submodule");
            }
        } catch (err) {
            console.error("Error:", err);
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddSubmodule = () => {
        navigate(`/lmsEdit/addSubmodule/${module.ModuleID}`);
    };


    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return (
            <div>
                <p className="text-red-500">{error}</p>
                <button onClick={onBack}>Back</button>
            </div>
        );
    }

    const handleViewContent = (submodule) => {
        setViewingContent(submodule);
    };

    const handleBackToSubmodules = () => {
        setViewingContent(null);
    };

    if (viewingContent) {
        return (
            <ViewContent 
                submodule={viewingContent} 
                onBack={handleBackToSubmodules}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        ← Back to Modules
                    </button>
                    <h1 className="text-2xl font-bold">
                        Submodules for: {module.ModuleName}
                    </h1>
                    <button
                        onClick={handleAddSubmodule}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Add New Submodule
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {submodules.length > 0 ? (
                        submodules.map((submodule) => (
                            <div
                                key={submodule.SubModuleID}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl"
                            >
                                {editingSubmodule?.SubModuleID === submodule.SubModuleID ? (
                                    <div className="p-6">
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            {/* Image Editing */}
                                            <div className="h-40 bg-gray-100 rounded-lg overflow-hidden mb-4">
                                                {isImageEditing ? (
                                                    <div className="h-full flex flex-col items-center justify-center p-4">
                                                        {imagePreview ? (
                                                            <img
                                                                src={imagePreview}
                                                                alt="Preview"
                                                                className="max-h-full object-contain"
                                                            />
                                                        ) : submodule.SubModuleImage ? (
                                                            <ByteArrayImage
                                                                byteArray={submodule.SubModuleImage.data}
                                                                className="max-h-full object-contain"
                                                            />
                                                        ) : (
                                                            <div className="text-gray-400">No Image</div>
                                                        )}
                                                        <input
                                                            type="file"
                                                            ref={fileInputRef}
                                                            onChange={handleImageChange}
                                                            accept="image/*"
                                                            className="hidden"
                                                            disabled={isCompressing}
                                                        />
                                                        <div className="flex gap-2 mt-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => fileInputRef.current.click()}
                                                                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                                                                disabled={isCompressing}
                                                            >
                                                                {imagePreview ? "Change" : "Upload"}
                                                            </button>
                                                            {(submodule.SubModuleImage || imagePreview) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={handleDeleteImage}
                                                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                                                                >
                                                                    Remove
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="relative h-full">
                                                        {submodule.SubModuleImage ? (
                                                            <ByteArrayImage
                                                                byteArray={submodule.SubModuleImage.data}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-full flex items-center justify-center text-gray-400">
                                                                No Image
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={() => setIsImageEditing(true)}
                                                            className="absolute top-2 right-2 bg-white/80 hover:bg-white p-1 rounded shadow"
                                                        >
                                                            ✏️
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Form Fields */}
                                            <input
                                                type="text"
                                                name="SubModuleName"
                                                value={editedData.SubModuleName || ''}
                                                onChange={handleChange}
                                                className="w-full border p-2 rounded"
                                                placeholder="Submodule Name"
                                                required
                                            />
                                            <textarea
                                                name="SubModuleDescription"
                                                value={editedData.SubModuleDescription || ''}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full border p-2 rounded"
                                                placeholder="Description"
                                            />
                                            <input
                                                type="number"
                                                name="Duration"
                                                value={editedData.Duration || ''}
                                                onChange={handleChange}
                                                className="w-full border p-2 rounded"
                                                placeholder="Duration (minutes)"
                                            />

                                            {error && <p className="text-red-500 text-sm">{error}</p>}

                                            <div className="flex space-x-2">
                                                <button
                                                    type="submit"
                                                    disabled={isSaving || isCompressing}
                                                    className="flex-1 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                                >
                                                    {isSaving ? "Saving..." : "Save"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCancelEdit}
                                                    className="flex-1 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <>
                                        <div className="h-40 bg-gray-100 overflow-hidden">
                                            {submodule.SubModuleImage ? (
                                                <ByteArrayImage
                                                    byteArray={submodule.SubModuleImage.data}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center text-gray-400 h-full">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                                                {submodule.SubModuleName}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-3">
                                                {submodule.SubModuleDescription || "No description"}
                                            </p>
                                            <p className="text-gray-500 text-sm mb-4">
                                                Duration: {submodule.Duration || 'N/A'} minutes
                                            </p>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditSubmodule(submodule)}
                                                    className="flex-1 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleViewContent(submodule)}
                                                    className="flex-1 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                                                >
                                                    View Content
                                                </button>
                                            </div>
                                            <div className="mt-2">
                                                <button
                                                    onClick={() => handleDeleteSubmodule(submodule.SubModuleID)}
                                                    className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full bg-white rounded-xl shadow-lg p-6 text-center">
                            <p className="text-gray-600">No submodules found</p>
                            <button
                                onClick={handleAddSubmodule}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Add New Submodule
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditSubModule;