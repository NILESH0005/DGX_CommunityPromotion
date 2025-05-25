import React, { useState, useEffect, useContext, useRef } from "react";
import ApiContext from "../../../../context/ApiContext";
import Swal from 'sweetalert2';
import AddUnitModal from "./AddUnitModal";

const ViewContent = ({ submodule, onBack }) => {
    const [units, setUnits] = useState([]);
    const [filteredUnits, setFilteredUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUnit, setEditingUnit] = useState(null);
    const [editedUnitData, setEditedUnitData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [files, setFiles] = useState([]);
    const [newFile, setNewFile] = useState(null);
    const fileInputRef = useRef(null);
    const [showAddUnitModal, setShowAddUnitModal] = useState(false);
    const [fileLink, setFileLink] = useState('');
    const [isUploading, setIsUploading] = useState(false);



    const { fetchData, userToken } = useContext(ApiContext);



    useEffect(() => {

        // Trigger a refetch of units to ensure we have the latest data
        const fetchUnits = async () => {
            try {
                setLoading(true);
                const response = await fetchData(
                    `dropdown/getUnitsWithFiles`,
                    "GET",
                    { 'auth-token': userToken }
                );

                if (response?.success) {
                    const validUnits = response.data.filter(unit => unit);
                    setUnits(validUnits);
                    const filtered = validUnits.filter(unit =>
                        unit.SubModuleID === submodule.SubModuleID
                    );
                    setFilteredUnits(filtered);

                    // Select the newly added unit if it exists in the response
                    const addedUnit = validUnits.find(unit => unit.UnitID === newUnit.UnitID);
                    if (addedUnit) {
                        setSelectedUnit(addedUnit);
                    }
                }
            } catch (err) {
                console.error("Error refetching units:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUnits();
        setShowAddUnitModal(false);


        fetchUnits();
    }, [submodule.SubModuleID, fetchData, userToken]);

    useEffect(() => {
        if (selectedUnit) {
            const fetchFiles = async () => {
                try {
                    const unitWithFiles = units.find(unit => unit.UnitID === selectedUnit.UnitID);
                    if (unitWithFiles && unitWithFiles.files) {
                        setFiles(unitWithFiles.files);
                    } else {
                        const response = await fetchData(
                            `lms/getFiles?unitId=${selectedUnit.UnitID}`,
                            "GET",
                            null,
                            { 'auth-token': userToken }
                        );
                        if (response?.success) {
                            setFiles(response.data);
                        }
                    }
                } catch (err) {
                    console.error("Error fetching files:", err);
                    setFiles([]);
                }
            };
            fetchFiles();
        }
    }, [selectedUnit, units, fetchData, userToken]);

    const handleEditUnit = (unit) => {
        setEditingUnit(unit);
        setEditedUnitData({
            UnitName: unit.UnitName,
            UnitDescription: unit.UnitDescription
        });
    };

    const handleCancelEditUnit = () => {
        setEditingUnit(null);
        setEditedUnitData({});
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

            const headers = {
                'Content-Type': 'application/json',
                'auth-token': userToken
            };

            const response = await fetchData(
                `lmsEdit/updateUnit/${editingUnit.UnitID}`,
                "POST",
                payload,
                headers
            );

            if (response?.success) {
                // Update both states using functional updates to ensure we have the latest state
                setUnits(prevUnits =>
                    prevUnits.map(unit =>
                        unit.UnitID === editingUnit.UnitID ?
                            { ...unit, ...response.data } :
                            unit
                    )
                );

                setFilteredUnits(prevFilteredUnits =>
                    prevFilteredUnits.map(unit =>
                        unit.UnitID === editingUnit.UnitID ?
                            { ...unit, ...response.data } :
                            unit
                    )
                );

                // Update selectedUnit if it's the one being edited
                if (selectedUnit?.UnitID === editingUnit.UnitID) {
                    setSelectedUnit(prev => ({ ...prev, ...response.data }));
                }

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
            // Optimistic update - immediately update the UI
            setUnits(prev => prev.map(unit =>
                unit.UnitID === unitId ? { ...unit, delStatus: 1 } : unit
            ));
            setFilteredUnits(prev => prev.map(unit =>
                unit.UnitID === unitId ? { ...unit, delStatus: 1 } : unit
            ));

            if (selectedUnit?.UnitID === unitId) {
                setSelectedUnit(null);
                setFiles([]);
            }

            // Then make the API call
            const response = await fetchData(
                "lmsEdit/deleteUnit",
                "POST",
                { unitId },
                {
                    "Content-Type": "application/json",
                    "auth-token": userToken
                }
            );

            if (!response?.success) {
                // If API fails, revert the optimistic update
                setUnits(prev => prev.map(unit =>
                    unit.UnitID === unitId ? { ...unit, delStatus: 0 } : unit
                ));
                setFilteredUnits(prev => prev.map(unit =>
                    unit.UnitID === unitId ? { ...unit, delStatus: 0 } : unit
                ));
                throw new Error(response?.message || "Failed to delete unit");
            }

            // If successful, remove the unit from the lists
            setUnits(prev => prev.filter(unit => unit.UnitID !== unitId));
            setFilteredUnits(prev => prev.filter(unit => unit.UnitID !== unitId));

            Swal.fire('Deleted!', 'Unit has been deleted.', 'success');
        } catch (err) {
            console.error("Delete error:", err);
            Swal.fire('Error!', `Failed to delete unit: ${err.message}`, 'error');
        }
    };

    const handleAddUnitClick = () => {
        setShowAddUnitModal(true);
    };
    const handleFileChange = (e) => {
        setNewFile(e.target.files[0]);
    };

    const handleUploadFile = async () => {
        if ((!newFile && !fileLink.trim()) || !selectedUnit) return;

        setIsUploading(true);
        try {
            const uploadToast = Swal.fire({
                title: 'Uploading...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            // Calculate equal percentage for all files (existing + new)
            const totalFilesAfterUpload = files.length + 1;
            const equalPercentage = (100 / totalFilesAfterUpload).toFixed(2);

            if (newFile) {
                const formData = new FormData();
                formData.append('file', newFile);
                formData.append('unitId', selectedUnit.UnitID);
                formData.append('percentage', equalPercentage);

                const response = await fetch(`${import.meta.env.VITE_API_BASEURL}lms/files`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'auth-token': userToken
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Upload failed');
                }

                const result = await response.json();
                await uploadToast.close();

                if (result.success) {
                    // Update all files' percentages in the frontend state
                    const updatedFiles = files.map(file => ({
                        ...file,
                        Percentage: equalPercentage
                    }));

                    // Add the new file with the same percentage
                    setFiles([...updatedFiles, {
                        ...result.data,
                        Percentage: equalPercentage
                    }]);

                    setNewFile(null);
                    setFileLink('');
                    Swal.fire('Success!', 'File uploaded successfully', 'success');
                } else {
                    throw new Error(result.message || "Failed to save");
                }
            } else if (fileLink.trim()) {
                // Handle link upload
                const response = await fetchData(
                    "lms/files",
                    "POST",
                    {
                        unitId: selectedUnit.UnitID,
                        link: fileLink,
                        percentage: equalPercentage,
                        fileName: fileLink.split('/').pop() || 'Link',
                        fileType: 'link'
                    },
                    {
                        'Content-Type': 'application/json',
                        'auth-token': userToken
                    }
                );

                await uploadToast.close();

                if (response?.success) {
                    // Update all files' percentages in the frontend state
                    const updatedFiles = files.map(file => ({
                        ...file,
                        Percentage: equalPercentage
                    }));

                    // Add the new link with the same percentage
                    setFiles([...updatedFiles, {
                        ...response.data,
                        Percentage: equalPercentage
                    }]);

                    setNewFile(null);
                    setFileLink('');
                    Swal.fire('Success!', 'Link saved successfully', 'success');
                } else {
                    throw new Error(response?.message || "Failed to save link");
                }
            }
        } catch (err) {
            console.error("Upload error:", err);
            Swal.fire('Error!', err.message || 'Failed to save', 'error');
        } finally {
            setIsUploading(false);
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
            setFiles(prev => prev.filter(file => file.FileID !== fileId));
            const response = await fetchData(
                "lmsEdit/deleteFile",
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

    const handleAddUnitSuccess = (newUnit) => {
        // Verify the newUnit has required properties
        if (!newUnit || !newUnit.UnitID) {
            console.error("Invalid unit data received:", newUnit);
            return;
        }

        // Update both units and filteredUnits states with the new unit
        setUnits(prev => [...prev, newUnit]);

        // Only add to filteredUnits if it belongs to current submodule
        if (newUnit.SubModuleID === submodule.SubModuleID) {
            setFilteredUnits(prev => [...prev, newUnit]);
        }

        // Select the newly added unit
        setSelectedUnit(newUnit);
        // Close the modal
        setShowAddUnitModal(false);
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
            <AddUnitModal
                isOpen={showAddUnitModal}
                onClose={() => setShowAddUnitModal(false)}
                onAddUnit={handleAddUnitSuccess}
                submodule={submodule}
                fetchData={fetchData}
                userToken={userToken}
            />

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
                        onClick={handleAddUnitClick}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Add New Unit
                    </button>
                </div>

                <div className="max-w-7xl mx-auto">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Units List */}
                        <div className="md:col-span-1 space-y-4">
                            <h2 className="text-xl font-semibold">Units</h2>
                            {filteredUnits.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredUnits.filter(unit => unit).map(unit => (
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
                                            {/* Unit Form Fields */}
                                            <input
                                                type="text"
                                                name="UnitName"
                                                value={editedUnitData.UnitName || ''}
                                                onChange={(e) => setEditedUnitData({
                                                    ...editedUnitData,
                                                    UnitName: e.target.value
                                                })}
                                                className="w-full border p-2 rounded"
                                                placeholder="Unit Name"
                                                required
                                            />
                                            <textarea
                                                name="UnitDescription"
                                                value={editedUnitData.UnitDescription || ''}
                                                onChange={(e) => setEditedUnitData({
                                                    ...editedUnitData,
                                                    UnitDescription: e.target.value
                                                })}
                                                rows={3}
                                                className="w-full border p-2 rounded"
                                                placeholder="Description"
                                            />

                                            {error && <p className="text-red-500 text-sm">{error}</p>}

                                            <div className="flex space-x-2">
                                                <button
                                                    type="submit"
                                                    disabled={isSaving}
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
                                            <p className="text-gray-600 mb-6">{selectedUnit.UnitDescription}</p>

                                            {/* Files Section */}
                                            <div className="mt-6">
                                                <h3 className="text-lg font-semibold mb-4">Files</h3>

                                                {/* File Upload Section */}
                                                <div className="mb-6 p-4 border border-dashed border-gray-300 rounded-lg">
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                    />
                                                    <div className="space-y-3">
                                                        <button
                                                            onClick={() => fileInputRef.current.click()}
                                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                        >
                                                            Select File
                                                        </button>

                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1">
                                                                <input
                                                                    type="text"
                                                                    value={fileLink}
                                                                    onChange={(e) => setFileLink(e.target.value)}
                                                                    placeholder="Or enter a file URL/link"
                                                                    className="w-full border p-2 rounded"
                                                                />
                                                            </div>
                                                            <span className="text-gray-500">OR</span>
                                                        </div>

                                                        {newFile && (
                                                            <div className="mt-2 flex items-center justify-between">
                                                                <span className="text-sm">{newFile.name}</span>
                                                                <button
                                                                    onClick={() => setNewFile(null)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        )}

                                                        <button
                                                            onClick={handleUploadFile}
                                                            disabled={!newFile && !fileLink.trim()}
                                                            className="px-3 py-1 bg-green-500 text-white rounded text-sm disabled:bg-gray-300"
                                                        >
                                                            {isUploading ? 'Uploading...' : 'Save'}
                                                        </button>
                                                    </div>
                                                </div>

                                                {files.length > 0 ? (
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full bg-white border border-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200">
                                                                {files.map(file => (
                                                                    <tr key={file.FileID} className="hover:bg-gray-50">
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="text-sm font-medium text-gray-900">{file.FilesName}</div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="text-sm text-gray-500">{file.FileType}</div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="text-sm text-gray-500">{file.AuthAdd}</div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                            <div className="flex space-x-2">
                                                                                <button
                                                                                    onClick={() => handleDeleteFile(file.FileID)}
                                                                                    className="text-red-600 hover:text-red-900"
                                                                                >
                                                                                    Delete
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
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
        </div>
    );
};

export default ViewContent;