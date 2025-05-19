import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Trash2, Plus, ChevronRight } from 'lucide-react';

const SubModuleList = ({ subModules, selectedSubModule, onSelectSubModule, onRemoveSubModule }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full"
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-500" />
                        Submodules
                    </h3>
                </div>

                {subModules.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
                    >
                        <Plus className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">No submodules added yet</p>
                        <p className="text-sm text-gray-400 mt-1">Add your first submodule to get started</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subModules.map((subModule, index) => (
                            <motion.div
                                key={subModule.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                whileHover={{ y: -2 }}
                                className={`relative rounded-lg border transition-all overflow-hidden ${
                                    selectedSubModule?.id === subModule.id 
                                        ? 'border-green-500 ring-2 ring-green-200' 
                                        : 'border-gray-200 hover:border-green-300'
                                }`}
                            >
                                <div 
                                    className="p-4 cursor-pointer"
                                    onClick={() => onSelectSubModule(subModule)}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-medium text-lg truncate ${
                                                selectedSubModule?.id === subModule.id 
                                                    ? 'text-green-600' 
                                                    : 'text-gray-800'
                                            }`}>
                                                {subModule.SubModuleName}
                                            </h4>
                                            <p className={`text-sm mt-1 ${
                                                selectedSubModule?.id === subModule.id 
                                                    ? 'text-green-700' 
                                                    : 'text-gray-600'
                                            } line-clamp-2`}>
                                                {subModule.SubModuleDescription || 'No description provided'}
                                            </p>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveSubModule(subModule.id);
                                            }}
                                            className={`p-1 rounded-full ${
                                                selectedSubModule?.id === subModule.id 
                                                    ? 'text-green-600 hover:bg-green-100' 
                                                    : 'text-gray-400 hover:bg-gray-100'
                                            }`}
                                            aria-label="Remove submodule"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Units section */}
                                <div className="border-t border-gray-100 bg-gray-50 p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-medium text-gray-500">
                                            {subModule.units.length} {subModule.units.length === 1 ? 'Unit' : 'Units'}
                                        </span>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectSubModule(subModule);
                                                // You might want to trigger add unit action here
                                            }}
                                            className="text-xs flex items-center text-green-600 hover:text-green-700 font-medium"
                                        >
                                            Add Unit <Plus className="w-3 h-3 ml-1" />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {subModule.units.length > 0 ? (
                                            subModule.units.slice(0, 3).map((unit, unitIndex) => (
                                                <motion.div
                                                    key={unitIndex}
                                                    whileHover={{ x: 2 }}
                                                    className="flex items-center px-2 py-1.5 text-sm bg-white rounded border border-gray-200 cursor-pointer hover:border-green-300"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Handle unit click if needed
                                                    }}
                                                >
                                                    <ChevronRight className="w-3 h-3 text-gray-400 mr-2" />
                                                    <span className="truncate">{unit.unitName || `Unit ${unitIndex + 1}`}</span>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="text-center py-2 text-xs text-gray-500">
                                                No units yet
                                            </div>
                                        )}

                                        {subModule.units.length > 3 && (
                                            <div className="text-center pt-1 text-xs text-gray-500">
                                                +{subModule.units.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SubModuleList;