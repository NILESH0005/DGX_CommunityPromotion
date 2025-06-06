import React, { useState, useRef, useContext, useEffect } from "react";
import { compressImage } from "../../../../utils/compressImage";
import Swal from "sweetalert2";
import ApiContext from "../../../../context/ApiContext";

const AddSubmodulePopup = ({ moduleId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    SubModuleName: "",
    SubModuleDescription: "",
    SubModuleImage: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef(null);

  const { fetchData, userToken, user } = useContext(ApiContext);

  // Validate form on change when form is dirty
  useEffect(() => {
    if (isDirty) {
      validateForm();
    }
  }, [formData, isDirty]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsDirty(true);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsDirty(true);

    // Reset previous image and preview
    if (formData.SubModuleImage) {
      URL.revokeObjectURL(imagePreview);
    }

    try {
      // Validate image type
      if (!file.type.match("image.*")) {
        setErrors((prev) => ({
          ...prev,
          image: "Only image files are allowed",
        }));
        return;
      }

      // Validate image size (200KB limit)
      if (file.size > 200 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size must be less than 200KB",
        }));
        return;
      }

      setIsCompressing(true);
      setErrors((prev) => ({ ...prev, image: null }));

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Compress image
      const compressedImage = await compressImage(file, {
        maxSizeMB: 0.2, // 200KB
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      // Verify compressed size
      if (compressedImage.size > 200 * 1024) {
        throw new Error("Compressed image still exceeds 200KB limit");
      }

      setFormData((prev) => ({
        ...prev,
        SubModuleImage: compressedImage,
      }));
    } catch (error) {
      console.error("Image processing error:", error);
      setErrors((prev) => ({
        ...prev,
        image: error.message || "Failed to process image",
      }));
      setImagePreview(null);
      setFormData((prev) => ({ ...prev, SubModuleImage: null }));
    } finally {
      setIsCompressing(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.SubModuleName?.trim()) {
      newErrors.SubModuleName = "Submodule name is required";
    } else if (formData.SubModuleName.trim().length > 100) {
      newErrors.SubModuleName = "Name must be less than 100 characters";
    }

    // Validate description length
    if (formData.SubModuleDescription.length > 500) {
      newErrors.SubModuleDescription =
        "Description must be less than 500 characters";
    }

    // Validate image
    if (!formData.SubModuleImage) {
      newErrors.image = "Please upload an image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsDirty(true);
    const isValid = validateForm();

    if (!isValid) {
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        document.querySelector(`[name="${firstErrorKey}"]`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    Swal.fire({
      title: "Confirm Submission",
      text: "Are you sure you want to add this submodule?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      backdrop: true,
      focusConfirm: false,
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
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
      SubModuleName: formData.SubModuleName.trim(),
      SubModuleDescription: formData.SubModuleDescription,
      SubModuleImage: formData.SubModuleImage,
      ModuleID: moduleId,
      UserName: user.Name,
    };

    try {
      const data = await fetchData(endpoint, method, body, headers);

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Submodule added successfully",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        }).then(() => {
          // Call onSave with the new submodule data
          onSave(moduleId, {
            SubModuleName: formData.SubModuleName,
            SubModuleDescription: formData.SubModuleDescription,
            SubModuleImage: formData.SubModuleImage,
          });
          onClose();
        });
      } else {
        throw new Error(data.message || "Failed to add submodule");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to add submodule",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, SubModuleImage: null }));
    setErrors((prev) => ({ ...prev, image: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate__animated animate__fadeInUp">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Add New Submodule</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image Upload */}
          <div className="relative group">
            <div
              className={`h-48 border-2 border-dashed rounded-lg overflow-hidden transition-all 
                            ${
                              errors.image
                                ? "border-red-500"
                                : "border-gray-300 hover:border-blue-400"
                            } 
                            ${imagePreview ? "bg-gray-50" : "bg-gray-100"}`}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-500 mb-3">
                    Drag & drop an image or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    Max size: 200KB (JPEG, PNG)
                  </p>
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
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                                            ${
                                              isCompressing
                                                ? "bg-blue-300 cursor-not-allowed"
                                                : "bg-blue-500 hover:bg-blue-600 text-white"
                                            }`}
                    disabled={isCompressing}
                  >
                    {isCompressing ? "Processing..." : "Select Image"}
                  </button>
                </div>
              )}
            </div>
            {errors.image && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.image}
              </p>
            )}
          </div>

          {/* Name Field */}
          <div className="space-y-1">
            <label
              htmlFor="SubModuleName"
              className="block text-sm font-medium text-gray-700"
            >
              Submodule Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="SubModuleName"
              name="SubModuleName"
              value={formData.SubModuleName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                                ${
                                  errors.SubModuleName
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
              placeholder="Enter submodule name"
            />
            {errors.SubModuleName && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.SubModuleName}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-1">
            <label
              htmlFor="SubModuleDescription"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="SubModuleDescription"
              name="SubModuleDescription"
              value={formData.SubModuleDescription}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                                ${
                                  errors.SubModuleDescription
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
              placeholder="Enter description (optional)"
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <div>
                {errors.SubModuleDescription && (
                  <span className="text-red-500 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.SubModuleDescription}
                  </span>
                )}
              </div>
              <span>{formData.SubModuleDescription.length}/500</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isCompressing}
              className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all
                                ${
                                  isSaving || isCompressing
                                    ? "bg-blue-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }`}
            >
              {isSaving ? (
                <span className="flex items-center justify-center">
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
                </span>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubmodulePopup;
