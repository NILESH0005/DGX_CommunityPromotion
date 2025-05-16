import React, { useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { compressImage } from '../../../../utils/compressImage';
import FileUploader from '../FileUploader';
import Swal from 'sweetalert2';
import ApiContext from '../../../../context/ApiContext';

const SubModuleTable = ({ module = {}, onSave, onCancel, onSelectSubmodule }) => {
    const { fetchData, userToken } = useContext(ApiContext);
    const [subModules, setSubModules] = useState(module.subModules || []);
    const [newSubModule, setNewSubModule] = useState({
        id: uuidv4(),
        SubModuleName: '',
        SubModuleDescription: '',
        SubModuleImage: null,
        SubModuleImagePreview: null
    });
    const [errors, setErrors] = useState({});
    const [selectedSubModule, setSelectedSubModule] = useState(null);
    const [newUnit, setNewUnit] = useState({ UnitName: '', UnitDescription: '', UnitImg: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [currentUploadContext, setCurrentUploadContext] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [hasUploadedFiles, setHasUploadedFiles] = useState(false);

    useEffect(() => {
        const filesExist = subModules.some(subModule =>
            subModule.units?.some(unit => unit.files?.length > 0)
        );
        setHasUploadedFiles(filesExist);
    }, [subModules]);

    const handleOpenUploadModal = (subModule, unit) => {
        setCurrentUploadContext({ subModule, unit });
        setShowUploadModal(true);
    };

    const handleFileSelect = (file) => {
        setUploadedFile(file);
    };

    // const handleUploadSubmit = () => {
    //     if (!uploadedFile) {
    //         setErrors({ file: 'Please select a file to upload' });
    //         return;
    //     }

    //     setIsSubmitting(true);

    //     const updatedSubModules = subModules.map(subModule => {
    //         if (subModule.id === currentUploadContext.subModule.id) {
    //             const updatedUnits = subModule.units.map(unit => {
    //                 if (unit.id === currentUploadContext.unit.id) {
    //                     return {
    //                         ...unit,
    //                         files: [
    //                             ...(unit.files || []),
    //                             {
    //                                 id: uuidv4(),
    //                                 FilesName: uploadedFile.name,
    //                                 FilePath: URL.createObjectURL(uploadedFile),
    //                                 FileType: uploadedFile.type,
    //                                 fileSize: uploadedFile.size,
    //                                 uploadedAt: new Date().toISOString()
    //                             }
    //                         ]
    //                     };
    //                 }
    //                 return unit;
    //             });
    //             return {
    //                 ...subModule,
    //                 units: updatedUnits
    //             };
    //         }
    //         return subModule;
    //     });

    //     setSubModules(updatedSubModules);
    //     setIsSubmitting(false);

    //     Swal.fire({
    //         title: 'Success!',
    //         text: 'File uploaded successfully',
    //         icon: 'success',
    //         confirmButtonText: 'OK'
    //     });

    //     setShowUploadModal(false);
    //     setUploadedFile(null);
    //     setCurrentUploadContext(null);
    // };

    // const handleUploadSubmit = async () => {
    //     if (!uploadedFile) {
    //         setErrors({ file: 'Please select a file to upload' });
    //         return;
    //     }

    //     setIsSubmitting(true);

    //     try {
    //         // Create FormData for Multer
    //         const formData = new FormData();
    //         formData.append('file', uploadedFile);
    //         formData.append('moduleId', module.id);
    //         formData.append('subModuleId', currentUploadContext.subModule.id);
    //         formData.append('unitId', currentUploadContext.unit.id);

    //         // Send to server
    //         const response = await fetch('http://localhost:8000/lms/upload', {
    //             method: 'POST',
    //             body: formData
    //             // Headers are automatically set by browser for FormData
    //         });

    //         const result = await response.json();

    //         if (!response.ok) throw new Error(result.message || 'Upload failed');

    //         // Update state with server response
    //         const updatedSubModules = subModules.map(subModule => {
    //             if (subModule.id === currentUploadContext.subModule.id) {
    //                 const updatedUnits = subModule.units.map(unit => {
    //                     if (unit.id === currentUploadContext.unit.id) {
    //                         return {
    //                             ...unit,
    //                             files: [
    //                                 ...(unit.files || []),
    //                                 {
    //                                     id: uuidv4(),
    //                                     FilesName: result.fileName,
    //                                     FilePath: result.filePath, // Server path
    //                                     FileType: uploadedFile.type,
    //                                     fileSize: uploadedFile.size,
    //                                     uploadedAt: new Date().toISOString()
    //                                 }
    //                             ]
    //                         };
    //                     }
    //                     return unit;
    //                 });
    //                 return {
    //                     ...subModule,
    //                     units: updatedUnits
    //                 };
    //             }
    //             return subModule;
    //         });

    //         setSubModules(updatedSubModules);

    //         Swal.fire({
    //             title: 'Success!',
    //             text: 'File uploaded successfully',
    //             icon: 'success',
    //             confirmButtonText: 'OK'
    //         });
    //     } catch (error) {
    //         Swal.fire({
    //             title: 'Error!',
    //             text: error.message,
    //             icon: 'error',
    //             confirmButtonText: 'OK'
    //         });
    //     } finally {
    //         setIsSubmitting(false);
    //         setShowUploadModal(false);
    //         setUploadedFile(null);
    //         setCurrentUploadContext(null);
    //     }
    // };

    // const handleUploadSubmit = async () => {
    //     if (!uploadedFile) {
    //         setErrors({ file: 'Please select a file to upload' });
    //         return;
    //     }

    //     setIsSubmitting(true);

    //     try {
    //         const formData = new FormData();
    //         formData.append('file', uploadedFile);
    //         formData.append('moduleId', module.id);
    //         formData.append('subModuleId', currentUploadContext.subModule.id);
    //         formData.append('unitId', currentUploadContext.unit.id);

    //         const response = await fetch('http://localhost:8000/lms/upload-learning-material', {
    //             method: 'POST',
    //             body: formData,
    //             headers: {
    //                 'auth-token': userToken
    //             }
    //         });

    //         if (!response.ok) {
    //             const errorData = await response.json();
    //             throw new Error(errorData.message || 'Upload failed');
    //         }

    //         const result = await response.json();
    //         const updatedSubModules = subModules.map(subModule => {
    //             if (subModule.id === currentUploadContext.subModule.id) {
    //                 const updatedUnits = subModule.units.map(unit => {
    //                     if (unit.id === currentUploadContext.unit.id) {
    //                         return {
    //                             ...unit,
    //                             files: [
    //                                 ...(unit.files || []),
    //                                 {
    //                                     id: uuidv4(),
    //                                     FilesName: result.file.name,
    //                                     FilePath: result.file.path,
    //                                     FileType: result.file.type,
    //                                     fileSize: result.file.size,
    //                                     uploadedAt: new Date().toISOString()
    //                                 }
    //                             ]
    //                         };
    //                     }
    //                     return unit;
    //                 });
    //                 return { ...subModule, units: updatedUnits };
    //             }
    //             return subModule;
    //         });

    //         setSubModules(updatedSubModules);

    //         Swal.fire({
    //             title: 'Success!',
    //             text: 'File uploaded successfully',
    //             icon: 'success',
    //             confirmButtonText: 'OK'
    //         });
    //     } catch (error) {
    //         Swal.fire({
    //             title: 'Upload Failed',
    //             text: error.message.includes('Failed to fetch')
    //                 ? 'Network error: Could not connect to server'
    //                 : error.message,
    //             icon: 'error',
    //             confirmButtonText: 'OK'
    //         });
    //     } finally {
    //         setIsSubmitting(false);
    //         setShowUploadModal(false);
    //         setUploadedFile(null);
    //         setCurrentUploadContext(null);
    //     }
    // };

    const handleUploadSubmit = async () => {
        if (!uploadedFile) {
            setErrors({ file: 'Please select a file to upload' });
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('file', uploadedFile); // Keep single file field name
            formData.append('moduleId', module.id);
            formData.append('subModuleId', currentUploadContext.subModule.id);
            formData.append('unitId', currentUploadContext.unit.id);

            const response = await fetch('http://localhost:8000/lms/upload-learning-material', {
                method: 'POST',
                body: formData,
                headers: {
                    'auth-token': userToken
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            const result = await response.json();

            // Update state with the uploaded file
            const updatedSubModules = subModules.map(subModule => {
                if (subModule.id === currentUploadContext.subModule.id) {
                    const updatedUnits = subModule.units.map(unit => {
                        if (unit.id === currentUploadContext.unit.id) {
                            return {
                                ...unit,
                                files: [
                                    ...(unit.files || []),
                                    {
                                        id: uuidv4(),
                                        originalName: result.file.originalName,
                                        serverName: result.file.storedName,
                                        filePath: result.file.filePath,
                                        storagePath: result.file.storagePath,
                                        fileType: result.file.fileType,
                                        fileSize: result.file.fileSize,
                                        uploadedAt: new Date().toISOString()
                                    }
                                ]
                            };
                        }
                        return unit;
                    });
                    return { ...subModule, units: updatedUnits };
                }
                return subModule;
            });

            setSubModules(updatedSubModules);

            // Show success message but keep modal open
            Swal.fire({
                title: 'Success!',
                text: 'File uploaded successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                // Reset file input but keep modal open
                setUploadedFile(null);
                // Clear any file input value to allow re-selecting the same file
                const fileInput = document.querySelector('#file-upload');
                if (fileInput) fileInput.value = '';
            });
        } catch (error) {
            Swal.fire({
                title: 'Upload Failed',
                text: error.message.includes('Failed to fetch')
                    ? 'Network error: Could not connect to server'
                    : error.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsSubmitting(false);
            // Don't close the modal here - let user upload another file
        }
    };

    // const handleUploadSubmit = async () => {
    //     if (!uploadedFile) {
    //         setErrors({ file: 'Please select a file to upload' });
    //         return;
    //     }

    //     setIsSubmitting(true);

    //     try {
    //         const formData = new FormData();

    //         // Handle both single file and array of files
    //         const filesToUpload = Array.isArray(uploadedFile) ? uploadedFile : [uploadedFile];

    //         filesToUpload.forEach(file => {
    //             formData.append('files', file); // Note 'files' for backend
    //         });

    //         formData.append('moduleId', module.id);
    //         formData.append('subModuleId', currentUploadContext.subModule.id);
    //         formData.append('unitId', currentUploadContext.unit.id);

    //         const response = await fetch('http://localhost:8000/lms/upload-learning-material', {
    //             method: 'POST',
    //             body: formData,
    //             headers: {
    //                 'auth-token': userToken
    //             }
    //         });

    //         if (!response.ok) {
    //             const errorData = await response.json();
    //             throw new Error(errorData.message || 'Upload failed');
    //         }

    //         const result = await response.json();

    //         // Update state with all uploaded files
    //         const updatedSubModules = subModules.map(subModule => {
    //             if (subModule.id === currentUploadContext.subModule.id) {
    //                 const updatedUnits = subModule.units.map(unit => {
    //                     if (unit.id === currentUploadContext.unit.id) {
    //                         const newFiles = result.files.map(file => ({
    //                             id: uuidv4(),
    //                             originalName: file.originalName,
    //                             serverName: file.storedName,
    //                             filePath: file.filePath,
    //                             storagePath: file.storagePath,
    //                             fileType: file.fileType,
    //                             fileSize: file.fileSize,
    //                             uploadedAt: new Date().toISOString()
    //                         }));

    //                         return {
    //                             ...unit,
    //                             files: [
    //                                 ...(unit.files || []),
    //                                 ...newFiles
    //                             ]
    //                         };
    //                     }
    //                     return unit;
    //                 });
    //                 return { ...subModule, units: updatedUnits };
    //             }
    //             return subModule;
    //         });

    //         setSubModules(updatedSubModules);

    //         // Remove successfully uploaded files from localStorage
    //         const remainingFiles = localFiles.filter(localFile =>
    //             !filesToUpload.some(uploaded =>
    //                 uploaded.name === localFile.file.name &&
    //                 uploaded.lastModified === localFile.file.lastModified
    //             )
    //         );
    //         localStorage.setItem('pendingUploads', JSON.stringify(remainingFiles));
    //         setLocalFiles(remainingFiles);

    //         Swal.fire({
    //             title: 'Success!',
    //             text: `Uploaded ${result.files.length} file(s) successfully`,
    //             icon: 'success',
    //             confirmButtonText: 'OK'
    //         });
    //     } catch (error) {
    //         Swal.fire({
    //             title: 'Upload Failed',
    //             text: error.message.includes('Failed to fetch')
    //                 ? 'Network error: Could not connect to server'
    //                 : error.message,
    //             icon: 'error',
    //             confirmButtonText: 'OK'
    //         });
    //     } finally {
    //         setIsSubmitting(false);
    //         setShowUploadModal(false);
    //         setUploadedFile(null);
    //         setCurrentUploadContext(null);
    //     }
    // };

    const handleAddSubModule = async () => {
        if (!newSubModule.SubModuleName.trim()) {
            setErrors({ SubModuleName: 'Submodule name is required' });
            return;
        }
        try {
            let bannerBase64 = null;
            if (newSubModule.SubModuleImage) {
                bannerBase64 = await compressImage(newSubModule.SubModuleImage);
            }
            const subModuleToAdd = {
                id: newSubModule.id,
                SubModuleName: newSubModule.SubModuleName.trim(),
                SubModuleDescription: newSubModule.SubModuleDescription.trim(),
                SubModuleImage: bannerBase64,
                units: []
            };
            setSubModules([...subModules, subModuleToAdd]);
            resetNewSubModuleForm();
        } catch (error) {
            console.error('Error adding submodule:', error);
        }
    };

    const handleAddUnit = () => {
        if (!newUnit.UnitName.trim()) {
            setErrors({ UnitName: 'Unit name is required' });
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
                            UnitName: newUnit.UnitName.trim(),
                            UnitDescription: newUnit.UnitDescription.trim(),
                            UnitImg: newUnit.UnitImg,
                            files: []
                        }
                    ]
                };
            }
            return sub;
        });

        setSubModules(updatedSubModules);
        setNewUnit({ UnitName: '', UnitDescription: '', UnitImg: null });
        setErrors({ ...errors, UnitName: null });
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

    const resetNewSubModuleForm = () => {
        setNewSubModule({
            id: uuidv4(),
            SubModuleName: '',
            SubModuleDescription: '',
            SubModuleImage: null,
            SubModuleImagePreview: null
        });
        setErrors({});
    };

    const handleSubModuleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setNewSubModule({
                    ...newSubModule,
                    SubModuleImage: file,
                    SubModuleImagePreview: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUnitImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setNewUnit({
                    ...newUnit,
                    UnitImg: file,
                    UnitImgPreview: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveOrSubmit = async () => {
        if (subModules.length === 0) {
            setErrors({ subModules: 'Please add at least one submodule' });
            return;
        }

        const result = await Swal.fire({
            title: hasUploadedFiles ? 'Ready to submit?' : 'Save changes?',
            text: hasUploadedFiles
                ? 'This will submit all your modules and uploaded files'
                : 'Your changes will be saved',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: hasUploadedFiles ? 'Yes, submit!' : 'Yes, save!'
        });

        if (result.isConfirmed) {
            setIsSubmitting(true);

            try {
                const updatedModule = {
                    ...module,
                    subModules: subModules
                };

                // Here you would call your API endpoint
                console.log('Submitting data:', updatedModule);
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                Swal.fire(
                    'Success!',
                    hasUploadedFiles
                        ? 'Your modules have been submitted successfully!'
                        : 'Your changes have been saved!',
                    'success'
                );

                onSave(updatedModule);
            } catch (error) {
                console.error('Submission failed:', error);
                Swal.fire(
                    'Error!',
                    'There was a problem processing your request',
                    'error'
                );
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const renderUnitsList = () => {
        return (
            <div className="space-y-6">
                {selectedSubModule.units.map(unit => (
                    <div key={unit.id} className="card bg-base-100 shadow-sm">
                        <div className="card-body">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium text-lg">{unit.UnitName}</h4>
                                    {unit.UnitDescription && (
                                        <p className="text-gray-600 mt-1 text-sm">
                                            {unit.UnitDescription}
                                        </p>
                                    )}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleOpenUploadModal(selectedSubModule, unit)}
                                        className="btn btn-xs btn-primary"
                                    >
                                        Upload Files
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveUnit(selectedSubModule.id, unit.id);
                                        }}
                                        className="btn btn-xs btn-error btn-outline"
                                    >
                                        Remove Unit
                                    </button>
                                </div>
                            </div>

                            {/* Render the files table */}
                            {renderFilesTable(unit.files)}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderFilesTable = (files = []) => {
        if (!files || files.length === 0) {
            return (
                <div className="alert alert-info mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>No files uploaded yet</span>
                </div>
            );
        }

        return (
            <div className="mt-4">
                <div className="overflow-x-auto">
                    <table className="table table-zebra table-sm">
                        <thead>
                            <tr>
                                <th>File Name</th>
                                <th>Type</th>
                                {/* <th>Size</th> */}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map(file => {
                                // Safely get file properties with fallbacks
                                const fileName = file.originalName || file.FilesName || 'Unknown file';
                                const fileType = file.fileType || file.FileType || 'application/octet-stream';
                                const filePath = file.filePath || file.FilePath || '';
                                const fileSize = file.fileSize || 0;
                                const uploadedAt = file.uploadedAt || new Date().toISOString();

                                return (
                                    <tr key={file.id || uuidv4()}>
                                        <td>
                                            <div className="flex items-center space-x-3">
                                                <div className="avatar">
                                                    <div className="mask mask-squircle w-12 h-12">
                                                        {(fileType.startsWith('image/') && filePath) ? (
                                                            <img src={filePath} alt={fileName} />
                                                        ) : (
                                                            <div className="flex items-center justify-center w-full h-full bg-gray-200">
                                                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold">{fileName}</div>
                                                    <div className="text-sm opacity-50">{new Date(uploadedAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {fileType.split('/')[1] || fileType}
                                        </td>
                                        {/* <td>
                                            {(fileSize / 1024).toFixed(2)} KB
                                        </td> */}
                                        <td>
                                            {filePath && (
                                                <button
                                                    className="btn btn-ghost btn-xs"
                                                    onClick={() => window.open(filePath, '_blank')}
                                                >
                                                    View
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {module.ModuleName}
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
                                className={`input input-bordered w-full ${errors.SubModuleName ? 'input-error' : ''}`}
                                value={newSubModule.SubModuleName}
                                onChange={(e) => {
                                    setNewSubModule({ ...newSubModule, SubModuleName: e.target.value });
                                    if (errors.SubModuleName) setErrors({ ...errors, SubModuleName: null });
                                }}
                            />
                            {errors.SubModuleName && (
                                <div className="label">
                                    <span className="label-text-alt text-error">{errors.SubModuleName}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text">Submodule Image</span>
                            </label>
                            <div className="flex items-center space-x-4">
                                {newSubModule.SubModuleImagePreview ? (
                                    <div className="avatar">
                                        <div className="w-16 h-16 rounded-lg">
                                            <img src={newSubModule.SubModuleImagePreview} alt="Preview" />
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
                                    onChange={handleSubModuleImageChange}
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
                                value={newSubModule.SubModuleDescription}
                                onChange={(e) => setNewSubModule({ ...newSubModule, SubModuleDescription: e.target.value })}
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
                                                    <h4 className="font-medium">{subModule.SubModuleName}</h4>
                                                    <p className="text-sm opacity-80 line-clamp-1">
                                                        {subModule.SubModuleDescription || 'No description'}
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
                                            <h3 className="card-title text-xl">{selectedSubModule.SubModuleName}</h3>
                                            {selectedSubModule.SubModuleDescription && (
                                                <p className="text-gray-600 mt-1">
                                                    {selectedSubModule.SubModuleDescription}
                                                </p>
                                            )}
                                        </div>
                                        {selectedSubModule.SubModuleImage && (
                                            <div className="avatar">
                                                <div className="w-16 rounded-lg">
                                                    <img src={selectedSubModule.SubModuleImage} alt="Submodule banner" />
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
                                                className={`input input-bordered w-full ${errors.UnitName ? 'input-error' : ''}`}
                                                value={newUnit.UnitName}
                                                onChange={(e) => {
                                                    setNewUnit({ ...newUnit, UnitName: e.target.value });
                                                    if (errors.UnitName) setErrors({ ...errors, UnitName: null });
                                                }}
                                            />
                                            {errors.UnitName && (
                                                <div className="label">
                                                    <span className="label-text-alt text-error">{errors.UnitName}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="label">
                                                <span className="label-text">Unit Image</span>
                                            </label>
                                            <div className="flex items-center space-x-4">
                                                {newUnit.UnitImgPreview ? (
                                                    <div className="avatar">
                                                        <div className="w-16 h-16 rounded-lg">
                                                            <img src={newUnit.UnitImgPreview} alt="Preview" />
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
                                                    onChange={handleUnitImageChange}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="label">
                                                <span className="label-text">Description</span>
                                            </label>
                                            <textarea
                                                placeholder="What will students learn in this unit?"
                                                className="textarea textarea-bordered w-full"
                                                rows={3}
                                                value={newUnit.UnitDescription}
                                                onChange={(e) => setNewUnit({ ...newUnit, UnitDescription: e.target.value })}
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddUnit}
                                            className="btn btn-primary"
                                            disabled={!newUnit.UnitName.trim()}
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
                    )}:{(
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
                            Upload Material for: {currentUploadContext?.unit?.UnitName}
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