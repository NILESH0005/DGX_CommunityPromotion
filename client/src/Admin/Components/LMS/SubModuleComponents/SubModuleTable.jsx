import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';
import { compressImage } from '../../../../utils/compressImage';

const SubModuleTable = ({ module = {}, onSave, onCancel }) => {
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

    // Add submodule handler
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

    // Add unit to selected submodule
    const handleAddUnit = () => {
        if (!newUnit.name.trim()) {
            Swal.fire('Error', 'Unit name is required', 'error');
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
    };

    // Save all changes
    const handleSaveAll = () => {
        if (subModules.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Submodules',
                text: 'Please add at least one submodule',
            });
            return;
        }

        const updatedModule = {
            ...module,
            subModules: subModules
        };

        onSave(updatedModule);
    };

    // Reset form
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

    // File change handler
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                    Submodules for: <span className="text-primary">{module.name}</span>
                </h3>
                <div className="badge badge-lg badge-primary">
                    {subModules.length} {subModules.length === 1 ? 'Submodule' : 'Submodules'}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Submodules List */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr className="bg-DGXgreen">
                                    <th>Name</th>
                                    <th>Units</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subModules.map((subModule) => (
                                    <tr 
                                        key={subModule.id} 
                                        className={`hover:bg-gray-50 ${selectedSubModule?.id === subModule.id ? 'bg-blue-50' : ''}`}
                                        onClick={() => setSelectedSubModule(subModule)}
                                    >
                                        <td>
                                            <div className="font-medium">{subModule.name}</div>
                                            <div className="text-sm text-gray-600 line-clamp-1">
                                                {subModule.description || 'No description'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-sm">
                                                {subModule.units.length} units
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveSubModule(subModule.id);
                                                }}
                                                className="btn btn-xs btn-error btn-outline"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column - Submodule/Unit Details */}
                <div className="space-y-6">
                    {selectedSubModule ? (
                        <>
                            <div className="card bg-base-100 shadow-sm">
                                <div className="card-body">
                                    <h4 className="card-title">
                                        {selectedSubModule.name}
                                    </h4>
                                    <p className="text-gray-600">
                                        {selectedSubModule.description || 'No description'}
                                    </p>
                                    {selectedSubModule.banner && (
                                        <div className="mt-2">
                                            <img 
                                                src={selectedSubModule.banner} 
                                                alt="Submodule banner" 
                                                className="h-32 object-contain rounded-lg"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="card bg-base-100 shadow-sm">
                                <div className="card-body">
                                    <h4 className="card-title">Add Unit</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="label">
                                                <span className="label-text">Unit Name *</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Introduction"
                                                className="input input-bordered w-full"
                                                value={newUnit.name}
                                                onChange={(e) => setNewUnit({...newUnit, name: e.target.value})}
                                            />
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
                                                onChange={(e) => setNewUnit({...newUnit, description: e.target.value})}
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddUnit}
                                            className="btn btn-primary w-full"
                                        >
                                            Add Unit
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Units List */}
                            {selectedSubModule.units.length > 0 && (
                                <div className="card bg-base-100 shadow-sm">
                                    <div className="card-body">
                                        <h4 className="card-title">Units in this Submodule</h4>
                                        <div className="space-y-2">
                                            {selectedSubModule.units.map(unit => (
                                                <div key={unit.id} className="p-3 border rounded-lg hover:bg-gray-50">
                                                    <h5 className="font-medium">{unit.name}</h5>
                                                    <p className="text-sm text-gray-600">
                                                        {unit.description || 'No description'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="card bg-base-100 shadow-sm">
                            <div className="card-body">
                                <div className="text-center py-8 text-gray-500">
                                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    <p>Select a submodule to add units</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add New Submodule Form */}
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                    <h4 className="card-title">Add New Submodule</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">
                                <span className="label-text">Submodule Name *</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Getting Started"
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
        </div>
    );
};

export default SubModuleTable;