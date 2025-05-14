import React, { useState, useReducer, useContext, useEffect } from 'react';
import ApiContext from '../../../context/ApiContext';
import Swal from "sweetalert2";
import ModuleComponent from './ModuleComponent';
import SubModuleComponent from './SubModuleComponent';
import UnitComponent from './UnitComponent';

const initialState = {
  module: null,
  subModule: null,
  unit: null,
  fileData: null,
  isCreatingModule: false,
  isEditingSubmodules: false,
  isEditingUnits: false
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
  const { fetchData } = useContext(ApiContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, dispatch] = useReducer(formReducer, initialState);

  // Load saved data from localStorage
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
    const dataToSave = { module: moduleData };
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

      const response = await fetchData(
        'lms/upload-learning-material',
        'POST',
        formData,
        {},
        true
      );

      if (response.success) {
        Swal.fire('Success', 'Learning material uploaded successfully', 'success');
        saveToLocalStorage(formState.module);
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to upload file', 'error');
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Learning Management System</h2>
        <p className="text-gray-600">Create and organize your educational content</p>
      </div>

      <div className="space-y-6">
        {formState.isCreatingModule ? (
          <ModuleComponent 
            mode="create"
            onCancel={() => dispatch({ type: 'RESET' })}
            onCreate={handleModuleCreated}
          />
        ) : !formState.module ? (
          <ModuleComponent 
            mode="empty"
            onCreateModule={() => dispatch({ type: 'START_CREATING_MODULE' })}
          />
        ) : formState.isEditingSubmodules ? (
          <SubModuleComponent
            module={formState.module}
            onSave={handleSubmoduleCreated}
            onCancel={() => dispatch({ type: 'SET_MODULE', payload: formState.module })}
            onSelectSubmodule={(subModule) => dispatch({
              type: 'START_EDITING_UNITS',
              payload: subModule
            })}
          />
        ) : formState.isEditingUnits ? (
          <UnitComponent
            subModule={formState.subModule}
            onUnitsUpdated={(units) => handleUnitsUpdated(formState.subModule.id, units)}
            onBack={() => dispatch({ type: 'SET_MODULE', payload: formState.module })}
            onSelectUnit={(unit) => dispatch({ type: 'SET_UNIT', payload: unit })}
          />
        ) : formState.unit ? (
          <UnitComponent
            mode="upload"
            unit={formState.unit}
            fileData={formState.fileData}
            onFileSelect={(file) => dispatch({ type: 'SET_FILE', payload: file })}
            onBack={() => dispatch({ type: 'SET_UNIT', payload: null })}
          />
        ) : (
          <ModuleComponent
            mode="view"
            module={formState.module}
            onManageSubmodules={() => dispatch({ type: 'SET_MODULE', payload: formState.module })}
          />
        )}

        <div className="flex justify-between pt-6 border-t">
          <div>
            {formState.module && (
              <button
                onClick={() => {
                  if (formState.unit) {
                    dispatch({ type: 'SET_UNIT', payload: null });
                  } else if (formState.isEditingUnits) {
                    dispatch({ type: 'SET_MODULE', payload: formState.module });
                  } else if (formState.isEditingSubmodules) {
                    dispatch({ type: 'RESET' });
                  }
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
              >
                <svg className="w-5 h-5 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
              disabled={isSubmitting}
            >
              Start Over
            </button>
            {formState.unit && formState.fileData && (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-DGXblue text-white rounded-md hover:bg-blue-600 transition"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Uploading...
                  </>
                ) : 'Submit Content'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningMaterialManager;