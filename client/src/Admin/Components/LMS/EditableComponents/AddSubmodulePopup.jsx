import React, { useState, useRef } from "react";
import { compressImage } from "../../../../utils/compressImage";
import Swal from 'sweetalert2';

const AddSubmodulePopup = ({ moduleId, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        SubModuleName: '',
        SubModuleDescription: '',
        SubModuleImage: null,
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
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
            setFormData(prev => ({
                ...prev,
                SubModuleImage: compressedImage
            }));

        } catch (error) {
            console.error("Image processing error:", error);
            setError("Failed to process image");
            setImagePreview(null);
        } finally {
            setIsCompressing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            if (!formData.SubModuleName?.trim()) {
                throw new Error("Submodule name is required");
            }

            await onSave(moduleId, formData);
            onClose();
        } catch (err) {
            console.error("Error:", err);
            setError(err.message);
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

                    <input
                        type="text"
                        name="SubModuleName"
                        value={formData.SubModuleName}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        placeholder="Submodule Name"
                        required
                    />

                    <textarea
                        name="SubModuleDescription"
                        value={formData.SubModuleDescription}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border p-2 rounded"
                        placeholder="Description"
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