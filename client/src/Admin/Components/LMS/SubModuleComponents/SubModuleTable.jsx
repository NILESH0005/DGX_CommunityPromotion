import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { compressImage } from '../../../../utils/compressImage';
import FileUploader from '../FileUploader';
import Swal from 'sweetalert2';


const SubModuleTable = ({ module = {}, onSave, onCancel, onSelectSubmodule }) => {
    const [subModules, setSubModules] = useState(module.subModules || []);
    const [newSubModule, setNewSubModule] = useState({
        id: uuidv4(),
        name: '',
        description: '',
        banner: null,
        bannerPreview: null
    });
    const [errors, setErrors] = useState({});
    const [selectedSubModule, setSelectedSubModule] = useState(null);
    const [newUnit, setNewUnit] = useState({ name: '', description: '' });
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [currentUploadContext, setCurrentUploadContext] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);

    const handleOpenUploadModal = (subModule, unit) => {
        setCurrentUploadContext({ subModule, unit });
        setShowUploadModal(true);
    };

    const handleFileSelect = (file) => {
        setUploadedFile(file);
    };


    const handleUploadSubmit = () => {
        if (!uploadedFile) {
            setErrors({ file: 'Please select a file to upload' });
            return;
        }

        setIsSubmitting(true);

        // Here you would typically call your API to upload the file
        // For now, we'll simulate the upload
        setTimeout(() => {
            setIsSubmitting(false);
            Swal.fire({
                title: 'Success!',
                text: 'File uploaded successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });

            // Close the modal and reset states
            setShowUploadModal(false);
            setUploadedFile(null);
            setCurrentUploadContext(null);
        }, 1500);
    };


    const handleAddSubModule = async () => {
        if (!newSubModule.name.trim()) {
            setErrors({ name: 'Submodule name is required' });
            return;
        }

        try {
            let bannerBase64 = null;
            if (newSubModule.banner) {
                bannerBase64 = await compressImage(newSubModule.banner);
            }

            const subModuleToAdd = {
                id: newSubModule.id,
                name: newSubModule.name.trim(),
                description: newSubModule.description.trim(),
                banner: bannerBase64,
                units: []
            };

            setSubModules([...subModules, subModuleToAdd]);
            resetNewSubModuleForm();
        } catch (error) {
            console.error('Error adding submodule:', error);
        }
    };

    const handleAddUnit = () => {
        if (!newUnit.name.trim()) {
            setErrors({ unitName: 'Unit name is required' });
            return;
        }

        const updatedSubModules = subModules.map(sub => {
            if (sub.id === selectedSubModule.id) {
                return {
                    ...sub,
                    units: [
                        ...sub.units,
                        {
                            id: uuidv4(),
                            name: newUnit.name.trim(),
                            description: newUnit.description.trim()
                        }
                    ]
                };
            }
            return sub;
        });

        setSubModules(updatedSubModules);
        setNewUnit({ name: '', description: '' });
        setErrors({ ...errors, unitName: null });
    };

    const handleSaveAll = () => {
        if (subModules.length === 0) {
            setErrors({ subModules: 'Please add at least one submodule' });
            return;
        }

        const updatedModule = {
            ...module,
            subModules: subModules
        };

        onSave(updatedModule);
    };

    const handleRemoveSubModule = (id) => {
        const updatedSubModules = subModules.filter(sub => sub.id !== id);
        setSubModules(updatedSubModules);
        if (selectedSubModule?.id === id) {
            setSelectedSubModule(null);
        }
    };

    const handleRemoveUnit = (subModuleId, unitId) => {
        const updatedSubModules = subModules.map(sub => {
            if (sub.id === subModuleId) {
                return {
                    ...sub,
                    units: sub.units.filter(unit => unit.id !== unitId)
                };
            }
            return sub;
        });
        setSubModules(updatedSubModules);
    };

    const handleSubmitFile = () => {
        if (!selectedFile) {
            setErrors({ file: 'Please select a file to upload' });
            return;
        }
        setIsSubmitting(true);
        // Simulate file upload
        setTimeout(() => {
            setIsSubmitting(false);
            setSelectedFile(null);
            setSelectedUnit(null);
        }, 1500);
    };

    const resetNewSubModuleForm = () => {
        setNewSubModule({
            id: uuidv4(),
            name: '',
            description: '',
            banner: null,
            bannerPreview: null
        });
        setErrors({});
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setNewSubModule({
                    ...newSubModule,
                    banner: file,
                    bannerPreview: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const renderUnitsList = () => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {selectedSubModule.units.map(unit => (
                    <motion.div
                        key={unit.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="card-body p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium text-lg">{unit.name}</h4>
                                    {unit.description && (
                                        <p className="text-gray-600 mt-1 text-sm">
                                            {unit.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleOpenUploadModal(selectedSubModule, unit)}
                                        className="btn btn-xs btn-primary"
                                    >
                                        Upload
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveUnit(selectedSubModule.id, unit.id);
                                        }}
                                        className="btn btn-xs btn-error btn-outline"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {module.name}
                    </h2>
                    <p className="text-gray-600">Manage submodules and their units</p>
                </div>
                <div className="badge badge-lg badge-primary">
                    {subModules.length} {subModules.length === 1 ? 'Submodule' : 'Submodules'}
                </div>
            </div>

            {errors.subModules && (
                <div className="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{errors.subModules}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body">
                            <h3 className="card-title">Submodules</h3>
                            <div className="space-y-2 mt-4">
                                {subModules.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                        <p>No submodules yet</p>
                                    </div>
                                ) : (
                                    subModules.map(subModule => (
                                        <motion.div
                                            key={subModule.id}
                                            whileHover={{ scale: 1.01 }}
                                            className={`p-4 rounded-lg cursor-pointer transition-all ${selectedSubModule?.id === subModule.id ? 'bg-primary text-primary-content' : 'bg-base-200 hover:bg-base-300'}`}
                                            onClick={() => setSelectedSubModule(subModule)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium">{subModule.name}</h4>
                                                    <p className="text-sm opacity-80 line-clamp-1">
                                                        {subModule.description || 'No description'}
                                                    </p>
                                                    <div className="badge badge-sm mt-2">
                                                        {subModule.units.length} units
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveSubModule(subModule.id);
                                                    }}
                                                    className="btn btn-xs btn-ghost"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submodule Details and Unit Management */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedSubModule && (
                        <>
                            {/* Submodule Details Card */}
                            <div className="card bg-base-100 shadow-sm">
                                <div className="card-body">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="card-title text-xl">{selectedSubModule.name}</h3>
                                            {selectedSubModule.description && (
                                                <p className="text-gray-600 mt-1">
                                                    {selectedSubModule.description}
                                                </p>
                                            )}
                                        </div>
                                        {selectedSubModule.banner && (
                                            <div className="avatar">
                                                <div className="w-16 rounded-lg">
                                                    <img src={selectedSubModule.banner} alt="Submodule banner" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Add Unit Form */}
                            <div className="card bg-base-100 shadow-sm">
                                <div className="card-body">
                                    <h3 className="card-title">Add New Unit</h3>
                                    <div className="space-y-4 mt-4">
                                        <div>
                                            <label className="label">
                                                <span className="label-text">Unit Name *</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Introduction to Components"
                                                className={`input input-bordered w-full ${errors.unitName ? 'input-error' : ''}`}
                                                value={newUnit.name}
                                                onChange={(e) => {
                                                    setNewUnit({ ...newUnit, name: e.target.value });
                                                    if (errors.unitName) setErrors({ ...errors, unitName: null });
                                                }}
                                            />
                                            {errors.unitName && (
                                                <div className="label">
                                                    <span className="label-text-alt text-error">{errors.unitName}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="label">
                                                <span className="label-text">Description</span>
                                            </label>
                                            <textarea
                                                placeholder="What will students learn in this unit?"
                                                className="textarea textarea-bordered w-full"
                                                rows={3}
                                                value={newUnit.description}
                                                onChange={(e) => setNewUnit({ ...newUnit, description: e.target.value })}
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddUnit}
                                            className="btn btn-primary"
                                            disabled={!newUnit.name.trim()}
                                        >
                                            Add Unit
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Units List */}
                            {selectedSubModule.units.length > 0 ? (
                                <div className="card bg-base-100 shadow-sm">
                                    <div className="card-body">
                                        <div className="flex justify-between items-center">
                                            <h3 className="card-title">Units ({selectedSubModule.units.length})</h3>
                                            <div className="text-sm text-gray-500">
                                                Click on a unit to manage content
                                            </div>
                                        </div>
                                        {renderUnitsList()}
                                    </div>
                                </div>
                            ) : (
                                <div className="card bg-base-100 shadow-sm">
                                    <div className="card-body">
                                        <div className="text-center py-8 text-gray-400">
                                            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                            <p>No units added yet. Add your first unit above.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}: {(
                        <div className="card bg-base-100 shadow-sm">
                            <div className="card-body">
                                <div className="text-center py-12 text-gray-400">
                                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    <h4 className="text-lg font-medium">Select a submodule</h4>
                                    <p className="mt-1">Choose a submodule from the list to view details and manage units</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add New Submodule */}
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                    <h3 className="card-title">Add New Submodule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                            <label className="label">
                                <span className="label-text">Submodule Name *</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., React Fundamentals"
                                className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                                value={newSubModule.name}
                                onChange={(e) => {
                                    setNewSubModule({ ...newSubModule, name: e.target.value });
                                    if (errors.name) setErrors({ ...errors, name: null });
                                }}
                            />
                            {errors.name && (
                                <div className="label">
                                    <span className="label-text-alt text-error">{errors.name}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text">Banner Image</span>
                            </label>
                            <div className="flex items-center space-x-4">
                                {newSubModule.bannerPreview ? (
                                    <div className="avatar">
                                        <div className="w-16 h-16 rounded-lg">
                                            <img src={newSubModule.bannerPreview} alt="Preview" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    className="file-input file-input-bordered w-full"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="label">
                                <span className="label-text">Description</span>
                            </label>
                            <textarea
                                placeholder="What will students learn in this submodule?"
                                className="textarea textarea-bordered w-full"
                                rows={3}
                                value={newSubModule.description}
                                onChange={(e) => setNewSubModule({ ...newSubModule, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            onClick={resetNewSubModuleForm}
                            className="btn btn-outline"
                        >
                            Clear Form
                        </button>
                        <button
                            onClick={handleAddSubModule}
                            className="btn btn-primary"
                        >
                            Add Submodule
                        </button>
                    </div>
                </div>
            </div>

            {/* Save/Cancel Buttons */}
            <div className="flex justify-between pt-6 border-t">
                <button
                    onClick={onCancel}
                    className="btn btn-outline"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSaveAll}
                    className="btn btn-primary"
                    disabled={subModules.length === 0}
                >
                    Save & Continue
                </button>
            </div>

            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="modal-box w-full max-w-2xl">
                        <h3 className="font-bold text-lg mb-4">
                            Upload Material for: {currentUploadContext?.unit?.name}
                        </h3>
                        <FileUploader
                            selectedFile={uploadedFile}
                            onFileSelect={handleFileSelect}
                        />
                        <div className="modal-action">
                            <button
                                onClick={() => {
                                    setShowUploadModal(false);
                                    setUploadedFile(null);
                                }}
                                className="btn btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUploadSubmit}
                                className="btn btn-primary"
                                disabled={!uploadedFile || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="loading loading-spinner"></span>
                                        Uploading...
                                    </>
                                ) : 'Upload File'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubModuleTable;