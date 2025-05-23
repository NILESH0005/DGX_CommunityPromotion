import React, { useState, useEffect, useContext, useRef } from "react";
import ApiContext from "../../../../context/ApiContext";
import ByteArrayImage from "../../../../utils/ByteArrayImage";
import { compressImage } from "../../../../utils/compressImage";
import Swal from 'sweetalert2';

const ViewContent = ({ submodule, onBack }) => {
    const [units, setUnits] = useState([]);
    const [filteredUnits, setFilteredUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUnit, setEditingUnit] = useState(null);
    const [editedUnitData, setEditedUnitData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [isImageEditing, setIsImageEditing] = useState(false);
    const [newUnitImage, setNewUnitImage] = useState(null);
    const [unitImagePreview, setUnitImagePreview] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [files, setFiles] = useState([]);
    const [newFile, setNewFile] = useState(null);
    const fileInputRef = useRef(null);
    const unitFileInputRef = useRef(null);

    const { fetchData, userToken } = useContext(ApiContext);

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                setLoading(true);
                const response = await fetchData(
                    `dropdown/getUnitsWithFiles`,
                    "GET",
                    { 'auth-token': userToken }
                );
                console.log("ddaaattaa", response);


                if (response?.success) {
                    setUnits(response.data);
                    const filtered = response.data.filter(unit => unit.SubModuleID === submodule.SubModuleID);
                    setFilteredUnits(filtered);
                } else {
                    setError(response?.message || "Failed to fetch units");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUnits();
    }, [submodule.SubModuleID, fetchData, userToken]);

    useEffect(() => {
        if (selectedUnit) {
            const fetchFiles = async () => {
                try {
                    const response = await fetchData(
                        `lms/getFiles?unitId=${selectedUnit.UnitID}`,
                        "GET",
                        null,
                        { 'auth-token': userToken }
                    );
                    if (response?.success) {
                        setFiles(response.data);
                    }
                } catch (err) {
                    console.error("Error fetching files:", err);
                }
            };
            fetchFiles();
        }
    }, [selectedUnit, fetchData, userToken]);

    // Unit CRUD Operations
    const handleEditUnit = (unit) => {
        setEditingUnit(unit);
        setEditedUnitData({
            UnitName: unit.UnitName,
            UnitDescription: unit.UnitDescription
        });
        setUnitImagePreview(
            unit.UnitImg
                ? `data:image/jpeg;base64,${unit.UnitImg.data}`
                : null
        );
    };

    const handleCancelEditUnit = () => {
        setEditingUnit(null);
        setEditedUnitData({});
        setUnitImagePreview(null);
        setNewUnitImage(null);
        setIsImageEditing(false);
    };

    const handleUnitImageChange = async (e) => {
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
            setUnitImagePreview(previewUrl);

            const compressedImage = await compressImage(file);
            setNewUnitImage(compressedImage);

        } catch (error) {
            console.error("Image processing error:", error);
            setError("Failed to process image");
            setUnitImagePreview(null);
            setNewUnitImage(null);
        } finally {
            setIsCompressing(false);
        }
    };

    const handleDeleteUnitImage = () => {
        setNewUnitImage(null);
        setUnitImagePreview(null);
    };

    const handleUpdateUnit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const payload = {
                UnitName: editedUnitData.UnitName,
                UnitDescription: editedUnitData.UnitDescription,
                SubModuleID: submodule.SubModuleID
            };

            let requestBody;
            let headers = { 'auth-token': userToken };

            if (newUnitImage) {
                const formData = new FormData();
                Object.entries(payload).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                formData.append("UnitImg", newUnitImage);
                requestBody = formData;
            } else if (!unitImagePreview && editingUnit?.UnitImg) {
                payload.UnitImg = null;
                headers['Content-Type'] = 'application/json';
                requestBody = JSON.stringify(payload);
            } else {
                headers['Content-Type'] = 'application/json';
                requestBody = JSON.stringify(payload);
            }

            const response = await fetchData(
                `lms/updateUnit/${editingUnit.UnitID}`,
                "POST",
                requestBody,
                headers,
                !!newUnitImage
            );

            if (response?.success) {
                setUnits(prev => prev.map(unit =>
                    unit.UnitID === editingUnit.UnitID ? response.data : unit
                ));
                handleCancelEditUnit();
                Swal.fire('Success!', 'Unit updated successfully', 'success');
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

    const handleDeleteUnit = async (unitId) => {
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
                "lms/deleteUnit",
                "POST",
                { unitId },
                {
                    "Content-Type": "application/json",
                    "auth-token": userToken
                }
            );

            if (response?.success) {
                setUnits(prev => prev.filter(unit => unit.UnitID !== unitId));
                if (selectedUnit?.UnitID === unitId) {
                    setSelectedUnit(null);
                    setFiles([]);
                }
                Swal.fire('Deleted!', 'Unit has been deleted.', 'success');
            } else {
                throw new Error(response?.message || "Failed to delete unit");
            }
        } catch (err) {
            console.error("Delete error:", err);
            Swal.fire('Error!', `Failed to delete unit: ${err.message}`, 'error');
        }
    };

    const handleAddUnit = async () => {
        // Similar to update but with create endpoint
        // You'll need to implement this based on your API
    };

    // File Operations
    const handleFileChange = (e) => {
        setNewFile(e.target.files[0]);
    };

    const handleUploadFile = async () => {
        if (!newFile || !selectedUnit) return;

        try {
            const formData = new FormData();
            formData.append("file", newFile);
            formData.append("unitId", selectedUnit.UnitID);
            formData.append("fileName", newFile.name);

            const response = await fetchData(
                "lms/uploadFile",
                "POST",
                formData,
                { 'auth-token': userToken },
                true
            );

            if (response?.success) {
                setFiles(prev => [...prev, response.data]);
                setNewFile(null);
                Swal.fire('Success!', 'File uploaded successfully', 'success');
            }
        } catch (err) {
            console.error("Upload error:", err);
            Swal.fire('Error!', 'Failed to upload file', 'error');
        }
    };

    const handleDeleteFile = async (fileId) => {
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
                "lms/deleteFile",
                "POST",
                { fileId },
                {
                    "Content-Type": "application/json",
                    "auth-token": userToken
                }
            );

            if (response?.success) {
                setFiles(prev => prev.filter(file => file.FileID !== fileId));
                Swal.fire('Deleted!', 'File has been deleted.', 'success');
            }
        } catch (err) {
            console.error("Delete error:", err);
            Swal.fire('Error!', 'Failed to delete file', 'error');
        }
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

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        ← Back to Submodules
                    </button>
                    <h1 className="text-2xl font-bold">
                        Content for: {submodule.SubModuleName}
                    </h1>
                    <button
                        onClick={handleAddUnit}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Add New Unit
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Units List */}
                    <div className="md:col-span-1 space-y-4">
                        <h2 className="text-xl font-semibold">Units</h2>
                        {filteredUnits.length > 0 ? (
                            <div className="space-y-4">
                                {filteredUnits.map(unit => (
                                    <div
                                        key={unit.UnitID}
                                        className={`p-4 rounded-lg cursor-pointer ${selectedUnit?.UnitID === unit.UnitID ? 'bg-blue-100' : 'bg-white hover:bg-gray-100'}`}
                                        onClick={() => setSelectedUnit(unit)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium">{unit.UnitName}</h3>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditUnit(unit);
                                                    }}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteUnit(unit.UnitID);
                                                    }}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No units found</p>
                        )}
                    </div>

                    {/* Unit Details and Files */}
                    <div className="md:col-span-2">
                        {selectedUnit ? (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                {editingUnit?.UnitID === selectedUnit.UnitID ? (
                                    <form onSubmit={handleUpdateUnit} className="space-y-4">
                                        {/* Unit Image */}
                                        <div className="h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                                            {isImageEditing ? (
                                                <div className="h-full flex flex-col items-center justify-center p-4">
                                                    {unitImagePreview ? (
                                                        <img
                                                            src={unitImagePreview}
                                                            alt="Preview"
                                                            className="max-h-full object-contain"
                                                        />
                                                    ) : selectedUnit.UnitImg ? (
                                                        <ByteArrayImage
                                                            byteArray={selectedUnit.UnitImg.data}
                                                            className="max-h-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="text-gray-400">No Image</div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        ref={unitFileInputRef}
                                                        onChange={handleUnitImageChange}
                                                        accept="image/*"
                                                        className="hidden"
                                                        disabled={isCompressing}
                                                    />
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => unitFileInputRef.current.click()}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                                                            disabled={isCompressing}
                                                        >
                                                            {unitImagePreview ? "Change" : "Upload"}
                                                        </button>
                                                        {(selectedUnit.UnitImg || unitImagePreview) && (
                                                            <button
                                                                type="button"
                                                                onClick={handleDeleteUnitImage}
                                                                className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative h-full">
                                                    {selectedUnit.UnitImg ? (
                                                        <ByteArrayImage
                                                            byteArray={selectedUnit.UnitImg.data}
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

                                        {/* Unit Form Fields */}
                                        <input
                                            type="text"
                                            name="UnitName"
                                            value={editedUnitData.UnitName || ''}
                                            onChange={(e) => handleChange(e)}
                                            className="w-full border p-2 rounded"
                                            placeholder="Unit Name"
                                            required
                                        />
                                        <textarea
                                            name="UnitDescription"
                                            value={editedUnitData.UnitDescription || ''}
                                            onChange={(e) => handleChange(e)}
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
                                                onClick={handleCancelEditUnit}
                                                className="flex-1 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <h2 className="text-xl font-semibold mb-4">{selectedUnit.UnitName}</h2>
                                        {selectedUnit.UnitImg && (
                                            <div className="mb-4">
                                                <ByteArrayImage
                                                    byteArray={selectedUnit.UnitImg.data}
                                                    className="w-full h-48 object-contain"
                                                />
                                            </div>
                                        )}
                                        <p className="text-gray-600 mb-6">{selectedUnit.UnitDescription}</p>

                                        {/* Files Section */}
                                        <div className="mt-6">
                                            <h3 className="text-lg font-semibold mb-4">Files</h3>

                                            {/* File Upload */}
                                            <div className="mb-6 p-4 border border-dashed border-gray-300 rounded-lg">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                                <button
                                                    onClick={() => fileInputRef.current.click()}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
                                                >
                                                    Select File
                                                </button>
                                                {newFile && (
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <span className="text-sm">{newFile.name}</span>
                                                        <button
                                                            onClick={handleUploadFile}
                                                            className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                                                        >
                                                            Upload
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Files List */}
                                            {files.length > 0 ? (
                                                <div className="space-y-2">
                                                    {files.map(file => (
                                                        <div key={file.FileID} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                            <div>
                                                                <p className="font-medium">{file.FilesName}</p>
                                                                <p className="text-sm text-gray-500">{file.FileType}</p>
                                                            </div>
                                                            <div className="flex space-x-2">
                                                                <a
                                                                    href={file.FilePath}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                                                                >
                                                                    View
                                                                </a>
                                                                <button
                                                                    onClick={() => handleDeleteFile(file.FileID)}
                                                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500">No files uploaded yet</p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                <p className="text-gray-600">Select a unit to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewContent;