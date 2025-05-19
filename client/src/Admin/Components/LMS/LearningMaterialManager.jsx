import React, { useState, useReducer, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FileText, UploadCloud, X, Plus, Trash2, ArrowLeft, Save, ChevronLeft, RefreshCw } from 'lucide-react';
import ApiContext from '../../../context/ApiContext';
import Swal from "sweetalert2";
import ModuleComponent from './ModuleComponent';
import SubModuleComponent from './SubModuleComponent';
import UnitComponent from './UnitComponent';
import { v4 as uuidv4 } from 'uuid';
import { compressImage } from '../../../utils/compressImage';

const initialState = {
  module: null,
  subModule: null,
  unit: null,
  fileData: null,
  isCreatingModule: false,
  isEditingSubmodules: false,
  isEditingUnits: false
};

const hasUploadedFiles = (module) => {
  if (!module || !module.subModules) return false;

  return module.subModules.some(subModule =>
    subModule.units?.some(unit =>
      unit.files && unit.files.length > 0
    )
  );
};

const formReducer = (state, action) => {
  switch (action.type) {
    case 'START_CREATING_MODULE':
      return {
        ...state,
        isCreatingModule: true,
        isEditingSubmodules: false,
        isEditingUnits: false
      };

    case 'SET_MODULE':
      return {
        ...state,
        module: action.payload ? {
          ...action.payload,
          subModules: action.payload.subModules || []
        } : null,
        isCreatingModule: false,
        isEditingSubmodules: !!action.payload,
        isEditingUnits: false,
        subModule: null,
        unit: null,
        fileData: null
      };

    case 'UPDATE_MODULE_WITH_SUBMODULES':
      return {
        ...state,
        module: {
          ...state.module,
          subModules: action.payload
        },
        isEditingSubmodules: false
      };

    case 'SET_SUBMODULE':
      return {
        ...state,
        subModule: action.payload,
        isEditingSubmodules: false,
        isEditingUnits: false,
        unit: null,
        fileData: null
      };

    case 'START_EDITING_UNITS':
      return {
        ...state,
        subModule: action.payload,
        isEditingUnits: true,
        isEditingSubmodules: false,
        unit: null
      };

    case 'UPDATE_SUBMODULE_UNITS':
      return {
        ...state,
        module: {
          ...state.module,
          subModules: state.module.subModules.map(subModule =>
            subModule.id === action.payload.subModuleId
              ? { ...subModule, units: action.payload.units }
              : subModule
          )
        },
        isEditingUnits: false
      };

    case 'SET_UNIT':
      return {
        ...state,
        unit: action.payload,
        fileData: null
      };

    case 'SET_FILE':
      return {
        ...state,
        fileData: action.payload
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
};

const LearningMaterialManager = () => {
  const { fetchData, user, userToken } = useContext(ApiContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, dispatch] = useReducer(formReducer, initialState);
  const [error, setError] = useState(null);

  const getCurrentDateTime = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
  const transformForBackend = async (moduleData) => {
    const currentUser = user?.username || 'system';
    const now = getCurrentDateTime();

    // Validate required fields
    if (!moduleData?.ModuleName || !moduleData?.subModules) {
      throw new Error("Module name and at least one submodule are required");
    }

    // Convert module image to base64 if it exists
    let moduleImageBase64 = moduleData.ModuleImage;
    if (moduleData.ModuleImage instanceof File) {
      moduleImageBase64 = await compressImage(moduleData.ModuleImage);
    }

    // Process submodules
    const processedSubModules = await Promise.all(
      moduleData.subModules.map(async (subModule) => {
        if (!subModule.SubModuleName) {
          throw new Error("SubModule name is required");
        }

        let subModuleImageBase64 = subModule.SubModuleImage;
        if (subModule.SubModuleImage instanceof File) {
          subModuleImageBase64 = await compressImage(subModule.SubModuleImage);
        }

        // Process units with safe UnitImg handling
        const processedUnits = await Promise.all(
          (subModule.units || []).map(async (unit) => {
            if (!unit.UnitName) {
              throw new Error("Unit name is required");
            }

            // Handle UnitImg - can be File, string (base64), null, or undefined
            let unitImageBase64 = '';
            if (unit.UnitImg instanceof File) {
              unitImageBase64 = await compressImage(unit.UnitImg);
            } else if (unit.UnitImg) {
              // If it's not a File but has value, assume it's already base64 string
              unitImageBase64 = unit.UnitImg;
            }
            // else case: unitImageBase64 remains empty string

            return {
              UnitName: unit.UnitName,
              UnitImg: unitImageBase64, // Will be empty string if no image
              UnitDescription: unit.UnitDescription || "",
              AuthAdd: currentUser,
              AddOnDt: now,
              editOnDt: now,
              delStatus: 0,
              Files: (unit.files || []).map(file => ({
                FilesName: file.originalName || `file_${Date.now()}`,
                FilePath: file.filePath || '',
                FileType: file.fileType || '',
                AuthAdd: currentUser,
                AddOnDt: now,
                editOnDt: now,
                delStatus: 0
              }))
            };
          })
        );

        return {
          SubModuleName: subModule.SubModuleName,
          SubModuleImage: subModuleImageBase64 || '',
          SubModuleDescription: subModule.SubModuleDescription || "",
          AuthAdd: currentUser,
          AddOnDt: now,
          editOnDt: now,
          delStatus: 0,
          Units: processedUnits
        };
      })
    );

    return {
      ModuleName: moduleData.ModuleName,
      ModuleImage: moduleImageBase64 || '',
      ModuleDescription: moduleData.ModuleDescription || "",
      AuthAdd: currentUser,
      AddOnDt: now,
      editOnDt: now,
      delStatus: 0,
      SubModules: processedSubModules
    };
  };

  useEffect(() => {
    const savedData = localStorage.getItem('learningMaterials');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      dispatch({
        type: 'SET_MODULE',
        payload: parsedData.module
      });
    }
  }, []);

  const saveToLocalStorage = (moduleData) => {
    const dataToSave = {
      module: {
        id: moduleData.id || uuidv4(),
        ModuleName: moduleData.ModuleName,
        ModuleImage: moduleData.ModuleImage,
        ModuleDescription: moduleData.ModuleDescription,
        subModules: moduleData.subModules.map(subModule => ({
          id: subModule.id || uuidv4(),
          SubModuleName: subModule.SubModuleName,
          SubModuleImage: subModule.SubModuleImage,
          SubModuleDescription: subModule.SubModuleDescription,
          units: subModule.units.map(unit => ({
            id: unit.id || uuidv4(),
            UnitName: unit.UnitName,
            UnitImg: unit.UnitImg,
            UnitDescription: unit.UnitDescription,
            files: unit.files || []
          }))
        }))
      }
    };
    localStorage.setItem('learningMaterials', JSON.stringify(dataToSave));
  };

  const handleSubmit = async () => {
    if (!formState.unit || !formState.fileData) {
      Swal.fire('Error', 'Please select a unit and upload a file', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', formState.fileData);
      formData.append('unitId', formState.unit.id);
      formData.append('moduleId', formState.module.id);

      if (formState.subModule) {
        formData.append('subModuleId', formState.subModule.id);
      }

      // Add auth info
      formData.append('authUser', user?.username || 'system');

      const uploadResponse = await fetchData(
        'lms/upload-learning-material',
        'POST',
        formData,
        {},
        true
      );

      if (uploadResponse.success) {
        const updatedModule = {
          ...formState.module,
          subModules: formState.module.subModules.map(subModule => {
            if (formState.subModule && subModule.id === formState.subModule.id) {
              return {
                ...subModule,
                units: subModule.units.map(unit => {
                  if (unit.id === formState.unit.id) {
                    return {
                      ...unit,
                      files: [
                        ...(unit.files || []),
                        {
                          id: uuidv4(),
                          originalName: uploadResponse.file.originalName,
                          filePath: uploadResponse.file.filePath,
                          fileType: uploadResponse.file.fileType,
                          fileSize: uploadResponse.file.fileSize,
                          uploadedAt: getCurrentDateTime()
                        }
                      ]
                    };
                  }
                  return unit;
                })
              };
            }
            return subModule;
          })
        };

        saveToLocalStorage(updatedModule);
        dispatch({ type: 'SET_MODULE', payload: updatedModule });

        Swal.fire('Success', 'Learning material uploaded successfully', 'success');
      } else {
        throw new Error(uploadResponse.message || 'Upload failed');
      }
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to upload file', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAllData = async () => {
    if (!formState.module) {
      Swal.fire('Error', 'No module data to submit', 'error');
      return;
    }

    if (!userToken) {
      Swal.fire('Error', 'Authentication token missing. Please log in again.', 'error');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const savedData = JSON.parse(localStorage.getItem('learningMaterials'));
      if (!savedData?.module) {
        throw new Error("No module data found in local storage");
      }

      const payload = await transformForBackend(savedData.module);
      console.log("Processed payload for submission:", payload);

      if (!payload.ModuleName || !Array.isArray(payload.SubModules)) {
        throw new Error("Invalid module structure - missing required fields");
      }

      payload.SubModules.forEach(subModule => {
        if (!subModule.SubModuleName) {
          throw new Error("SubModule name is required");
        }
        subModule.Units.forEach(unit => {
          if (!unit.UnitName) {
            throw new Error("Unit name is required");
          }
        });
      });

      const response = await fetchData(
        'lms/save-learning-materials',
        'POST',
        payload, // Send as object, let fetchData handle stringification
        {
          'Content-Type': 'application/json',
          'auth-token': userToken
        }
      );

      if (!response) {
        throw new Error("No response received from server");
      }

      if (response.success) {
        Swal.fire('Success', 'All learning materials submitted successfully', 'success');
        localStorage.removeItem('learningMaterials');
        dispatch({ type: 'RESET' });
      } else {
        throw new Error(response.message || "Submission failed");
      }
    } catch (error) {
      console.error("Detailed submission error:", error);
      setError(error.message);
      Swal.fire('Error', error.message || 'Failed to submit learning materials', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModuleCreated = (newModule) => {
    const learningData = { ...newModule, subModules: [] };
    dispatch({ type: 'SET_MODULE', payload: learningData });
    saveToLocalStorage(learningData);
  };

  const handleSubmoduleCreated = (updatedModule) => {
    dispatch({ type: 'SET_MODULE', payload: updatedModule });
    saveToLocalStorage(updatedModule);
  };

  const handleUnitsUpdated = (subModuleId, units) => {
    dispatch({
      type: 'UPDATE_SUBMODULE_UNITS',
      payload: { subModuleId, units }
    });
    saveToLocalStorage({
      ...formState.module,
      subModules: formState.module.subModules.map(subModule =>
        subModule.id === subModuleId
          ? { ...subModule, units }
          : subModule
      )
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 bg-DGXgray/5 rounded-xl"
      >
        <h2 className="text-3xl font-bold text-DGXblue flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-DGXgreen" />
          Learning Management System
        </h2>
        <p className="text-DGXgray mt-2">Create and organize your educational content</p>
      </motion.div>

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {formState.isCreatingModule ? (
            <motion.div
              key="create-module"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ModuleComponent
                mode="create"
                onCancel={() => dispatch({ type: 'RESET' })}
                onCreate={handleModuleCreated}
              />
            </motion.div>
          ) : !formState.module ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ModuleComponent
                mode="empty"
                onCreateModule={() => dispatch({ type: 'START_CREATING_MODULE' })}
              />
            </motion.div>
          ) : formState.isEditingSubmodules ? (
            <motion.div
              key="edit-submodules"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SubModuleComponent
                module={formState.module}
                onSave={handleSubmoduleCreated}
                onCancel={() => dispatch({ type: 'SET_MODULE', payload: formState.module })}
                onSelectSubmodule={(subModule) => dispatch({
                  type: 'START_EDITING_UNITS',
                  payload: subModule
                })}
              />
            </motion.div>
          ) : formState.isEditingUnits ? (
            <motion.div
              key="edit-units"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UnitComponent
                subModule={formState.subModule}
                onUnitsUpdated={(units) => handleUnitsUpdated(formState.subModule.id, units)}
                onBack={() => dispatch({ type: 'SET_MODULE', payload: formState.module })}
                onSelectUnit={(unit) => dispatch({ type: 'SET_UNIT', payload: unit })}
              />
            </motion.div>
          ) : formState.unit ? (
            <motion.div
              key="upload-file"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UnitComponent
                mode="upload"
                unit={formState.unit}
                fileData={formState.fileData}
                onFileSelect={(file) => dispatch({ type: 'SET_FILE', payload: file })}
                onBack={() => dispatch({ type: 'SET_UNIT', payload: null })}
              />
            </motion.div>
          ) : (
            <motion.div
              key="view-module"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ModuleComponent
                mode="view"
                module={formState.module}
                onManageSubmodules={() => dispatch({ type: 'SET_MODULE', payload: formState.module })}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <motion.div 
          className="flex justify-between pt-6 mt-6 border-t border-DGXgray/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            {formState.module && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (formState.unit) {
                    dispatch({ type: 'SET_UNIT', payload: null });
                  } else if (formState.isEditingUnits) {
                    dispatch({ type: 'SET_MODULE', payload: formState.module });
                  } else if (formState.isEditingSubmodules) {
                    dispatch({ type: 'RESET' });
                  }
                }}
                className="px-4 py-2.5 rounded-lg border border-DGXgray/30 text-DGXblue hover:bg-DGXgray/10 flex items-center gap-2 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </motion.button>
            )}
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => dispatch({ type: 'RESET' })}
              className="px-4 py-2.5 rounded-lg border border-DGXgray/30 text-DGXblue hover:bg-DGXgray/10 flex items-center gap-2 transition-colors"
              disabled={isSubmitting}
            >
              <RefreshCw className="w-5 h-5" />
              Start Over
            </motion.button>

            {/* Show different buttons based on state */}
            {formState.unit && formState.fileData ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-lg bg-DGXgreen hover:bg-[#68a600] text-DGXwhite flex items-center gap-2 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5" />
                    Upload File
                  </>
                )}
              </motion.button>
            ) : formState.module && hasUploadedFiles(formState.module) ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmitAllData}
                className="px-6 py-2.5 rounded-lg bg-DGXblue hover:bg-[#013045] text-DGXwhite flex items-center gap-2 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Submit All Content
                  </>
                )}
              </motion.button>
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LearningMaterialManager;