import React, { useState, useRef, useContext } from "react";
import { compressImage } from "../../../../utils/compressImage";
import Swal from 'sweetalert2';
import ApiContext from "../../../../context/ApiContext";

const AddSubmodulePopup = ({ moduleId, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        SubModuleName: '',
        SubModuleDescription: '',
        SubModuleImage: null,
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);
    
    const { fetchData, userToken, user } = useContext(ApiContext);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            if (!file.type.match('image.*')) {
                setErrors(prev => ({ ...prev, image: "Only image files are allowed" }));
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, image: "Image size must be less than 2MB" }));
                return;
            }

            setIsCompressing(true);
            setErrors(prev => ({ ...prev, image: null }));

            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);

            const compressedImage = await compressImage(file);
            setFormData(prev => ({
                ...prev,
                SubModuleImage: compressedImage
            }));

        } catch (error) {
            console.error("Image processing error:", error);
            setErrors(prev => ({ ...prev, image: "Failed to process image" }));
            setImagePreview(null);
        } finally {
            setIsCompressing(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.SubModuleName?.trim()) {
            newErrors.SubModuleName = "Submodule name is required";
        }
        if (!formData.SubModuleImage) {
            newErrors.image = "Please upload an image";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        Swal.fire({
            title: "Confirm Submission",
            text: "Are you sure you want to add this submodule?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Confirm",
            cancelButtonText: "Cancel",
        }).then(async (result) => {
            if (result.isConfirmed) {
                await handleConfirmSubmit();
            }
        });
    };

    const handleConfirmSubmit = async () => {
        setIsSaving(true);

        const endpoint = "lmsEdit/addSubmodule";
        const method = "POST";
        const headers = {
            "Content-Type": "application/json",
            "auth-token": userToken,
        };
        const body = {
            SubModuleName: formData.SubModuleName,
            SubModuleDescription: formData.SubModuleDescription,
            SubModuleImage: formData.SubModuleImage,
            ModuleID: moduleId,
            UserName: user.Name // Assuming you want to track who added it
        };

        try {
            const data = await fetchData(endpoint, method, body, headers);

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Submodule added successfully',
                    timer: 2000,
                    showConfirmButton: false
                });

                if (onSave) {
                    onSave(data.data);
                }

                onClose();
            } else {
                throw new Error(data.message || 'Failed to add submodule');
            }
        } catch (error) {
            console.error("Error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to add submodule',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add New Submodule</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image Upload */}
                    <div className="h-40 bg-gray-100 rounded-lg overflow-hidden mb-4">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-4">
                                <div className="text-gray-400 mb-2">No Image</div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                    disabled={isCompressing}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                                    disabled={isCompressing}
                                >
                                    Upload Image
                                </button>
                            </div>
                        )}
                    </div>
                    {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}

                    <div>
                        <input
                            type="text"
                            name="SubModuleName"
                            value={formData.SubModuleName}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            placeholder="Submodule Name"
                            required
                        />
                        {errors.SubModuleName && <p className="text-red-500 text-sm">{errors.SubModuleName}</p>}
                    </div>

                    <div>
                        <textarea
                            name="SubModuleDescription"
                            value={formData.SubModuleDescription}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border p-2 rounded"
                            placeholder="Description"
                        />
                    </div>

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
                            onClick={onClose}
                            className="flex-1 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSubmodulePopup;