import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { PlusCircle, Image, X, Check } from 'lucide-react';

const AddSubModuleForm = ({ onAddSubModule, errors, setErrors }) => {
    const [newSubModule, setNewSubModule] = useState({
        id: uuidv4(),
        SubModuleName: '',
        SubModuleDescription: '',
        SubModuleImage: null,
        SubModuleImagePreview: null
    });

    const handleSubModuleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (200KB = 200 * 1024 bytes)
        if (file.size > 200 * 1024) {
            setErrors({
                ...errors,
                SubModuleImage: 'Image size must be 200KB or less'
            });
            // Clear the file input
            e.target.value = '';
            return;
        }

        // Clear any previous image errors
        if (errors.SubModuleImage) {
            setErrors({
                ...errors,
                SubModuleImage: null
            });
        }

        const reader = new FileReader();
        reader.onload = () => {
            setNewSubModule({
                ...newSubModule,
                SubModuleImage: file,
                SubModuleImagePreview: reader.result
            });
        };
        reader.readAsDataURL(file);
    };

    const resetForm = () => {
        setNewSubModule({
            id: uuidv4(),
            SubModuleName: '',
            SubModuleDescription: '',
            SubModuleImage: null,
            SubModuleImagePreview: null
        });
        setErrors({});
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-DGXwhite rounded-xl shadow-lg overflow-hidden border border-DGXgray/20"
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-DGXblue flex items-center gap-2">
                        <PlusCircle className="w-6 h-6 text-DGXgreen" />
                        Add New Submodule
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Submodule Name Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-DGXblue">
                            Submodule Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="e.g., React Fundamentals"
                                className={`w-full px-4 py-3 rounded-lg border ${
                                    errors.SubModuleName 
                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                        : 'border-DGXgray/30 focus:ring-DGXgreen focus:border-DGXgreen'
                                } bg-DGXwhite text-DGXblack transition duration-200`}
                                value={newSubModule.SubModuleName}
                                onChange={(e) => {
                                    setNewSubModule({ ...newSubModule, SubModuleName: e.target.value });
                                    if (errors.SubModuleName) setErrors({ ...errors, SubModuleName: null });
                                }}
                            />
                            {errors.SubModuleName && (
                                <motion.p 
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-1 text-sm text-red-600 flex items-center gap-1"
                                >
                                    <X className="w-4 h-4" />
                                    {errors.SubModuleName}
                                </motion.p>
                            )}
                        </div>
                    </div>

                    {/* Image Upload Field */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-DGXblue">
                            Submodule Image
                        </label>
                        <div className="flex items-center gap-4">
                            <motion.label 
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-dashed ${
                                    newSubModule.SubModuleImagePreview 
                                        ? 'border-transparent' 
                                        : errors.SubModuleImage
                                            ? 'border-red-500'
                                            : 'border-DGXgray/30 hover:border-DGXgreen'
                                } flex items-center justify-center cursor-pointer bg-DGXgray/10 relative`}
                            >
                                {newSubModule.SubModuleImagePreview ? (
                                    <img 
                                        src={newSubModule.SubModuleImagePreview} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-DGXgray">
                                        <Image className="w-6 h-6 mb-1" />
                                        <span className="text-xs">Upload</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleSubModuleImageChange}
                                />
                            </motion.label>
                            
                            <div className="flex-1">
                                <p className="text-sm text-DGXgray">
                                    {newSubModule.SubModuleImage 
                                        ? newSubModule.SubModuleImage.name 
                                        : "JPG, PNG or GIF (Max 200KB)"}
                                </p>
                                {errors.SubModuleImage && (
                                    <motion.p 
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-1 text-sm text-red-600 flex items-center gap-1"
                                    >
                                        <X className="w-4 h-4" />
                                        {errors.SubModuleImage}
                                    </motion.p>
                                )}
                                {newSubModule.SubModuleImage && !errors.SubModuleImage && (
                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        type="button"
                                        onClick={() => setNewSubModule({...newSubModule, SubModuleImage: null, SubModuleImagePreview: null})}
                                        className="mt-1 text-xs text-red-600 hover:text-red-800 transition"
                                    >
                                        Remove image
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description Field */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-medium text-DGXblue">
                            Description
                        </label>
                        <textarea
                            placeholder="What will students learn in this submodule?"
                            className="w-full px-4 py-3 rounded-lg border border-DGXgray/30 focus:ring-DGXgreen focus:border-DGXgreen bg-DGXwhite text-DGXblack transition duration-200"
                            rows={4}
                            value={newSubModule.SubModuleDescription}
                            onChange={(e) => setNewSubModule({ ...newSubModule, SubModuleDescription: e.target.value })}
                        />
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 mt-8">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-2.5 rounded-lg border border-DGXgray/30 text-DGXblue hover:bg-DGXgray/10 transition duration-200 font-medium"
                    >
                        Clear Form
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => onAddSubModule(newSubModule)}
                        disabled={!!errors.SubModuleImage}
                        className="px-6 py-2.5 rounded-lg bg-DGXgreen hover:bg-[#68a600] text-DGXwhite font-medium transition duration-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <Check className="w-5 h-5" />
                        Add Submodule
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default AddSubModuleForm;