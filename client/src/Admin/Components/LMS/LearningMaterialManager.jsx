import React, { useState, useReducer, useContext } from 'react';
import ApiContext from '../../../context/ApiContext';
import Swal from "sweetalert2";
import UnitSelector from './UnitComponents/UnitSelector';
import FileUploader from './FileUploader';
import ModuleCreator from './ModuleComponents/ModuleCreator';
import SubModuleTable from './SubModuleComponents/SubModuleTable';

const formReducer = (state, action) => {
  console.log('Reducer action:', action.type, 'Payload:', action.payload);
  switch (action.type) {
    case 'UPDATE_MODULE_SUBMODULES':
      return {
        ...state,
        module: {
          ...state.module,
          subModules: action.payload
        },
        isEditingSubmodules: false
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


    case 'CANCEL_SUBMODULES':
      return {
        ...state,
        isEditingSubmodules: false
      };
    case 'START_CREATING_MODULE':
      return {
        ...state,
        isCreatingModule: true,
        isEditingSubmodules: false
      };

    case 'SET_MODULE':
      return {
        ...state,
        module: {
          ...action.payload,
          subModules: action.payload.subModules || []
        },
        isCreatingModule: false,
        isEditingSubmodules: true,
        subModule: null,
        unit: null,
        fileData: null
      };

    case 'ADD_SUBMODULE':
      return {
        ...state,
        module: {
          ...state.module,
          subModules: [...state.module.subModules, action.payload]
        }
      };

    case 'REMOVE_SUBMODULE':
      return {
        ...state,
        module: {
          ...state.module,
          subModules: state.module.subModules.filter(
            sub => sub.id !== action.payload
          )
        }
      };

    case 'SET_SUBMODULE':
      return {
        ...state,
        subModule: action.payload,
        isEditingSubmodules: false,
        unit: null,
        fileData: null
      };

    case 'ADD_UNIT':
      return {
        ...state,
        module: {
          ...state.module,
          subModules: state.module.subModules.map(subModule => {
            if (subModule.id === action.payload.subModuleId) {
              return {
                ...subModule,
                units: [...subModule.units, action.payload.unit]
              };
            }
            return subModule;
          })
        }
      };

    case 'SET_UNIT':
      return {
        ...state,
        unit: action.payload
      };

    case 'SET_FILE':
      return {
        ...state,
        fileData: action.payload
      };

    case 'UPDATE_SUBMODULE_UNITS':
      return {
        ...state,
        module: {
          ...state.module,
          subModules: state.module.subModules.map(subModule => {
            if (subModule.id === action.payload.subModuleId) {
              return {
                ...subModule,
                units: action.payload.units
              };
            }
            return subModule;
          })
        }
      };

    case 'START_EDITING_UNITS':
      return {
        ...state,
        isEditingUnits: true
      };

    case 'CANCEL_UNITS':
      return {
        ...state,
        isEditingUnits: false
      };
    case 'FINISH_SUBMODULES':
      return {
        ...state,
        isEditingSubmodules: false
      };

    case 'RESET':
      return {
        module: null,
        subModule: null,
        unit: null,
        fileData: null,
        isCreatingModule: false,
        isEditingSubmodules: false
      };
    case 'START_EDITING_UNITS':
      return {
        ...state,
        isEditingUnits: true,
        unit: null
      };

    case 'FINISH_UNITS':
      return {
        ...state,
        isEditingUnits: false
      };

    default:
      return state;
  }
};

const LearningMaterialManager = () => {
  const { fetchData } = useContext(ApiContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, dispatch] = useReducer(formReducer, {
    module: null,
    subModule: null,
    unit: null,
    fileData: null,
    isCreatingModule: false,
    isEditingSubmodules: false
  });

  const handleSubmit = async () => {
    if (!formState.unit || !formState.fileData) {
      Swal.fire({
        icon: 'error',
        title: 'Incomplete Form',
        text: 'Please select a unit and upload a file',
      });
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
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Learning material uploaded successfully',
        });
        dispatch({ type: 'RESET' });
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: error.message || 'Failed to upload file',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModuleCreated = (newModule) => {
    dispatch({
      type: 'SET_MODULE',
      payload: newModule // Pass the entire module object
    });
  };

  const handleSubmoduleCreated = (updatedModule) => {
    dispatch({
      type: 'SET_MODULE',
      payload: updatedModule // Pass the entire updated module
    });
  };
  const handleUnitCreated = (subModuleId, unit) => {
    dispatch({
      type: 'ADD_UNIT',
      payload: { subModuleId, unit }
    });
  };


  const handleRemoveSubmodule = (id) => {
    dispatch({
      type: 'REMOVE_SUBMODULE',
      payload: id
    });
  };

  const handleFinishSubmodules = () => {
    dispatch({ type: 'FINISH_SUBMODULES' });
  };

  const handleSelectSubmodule = (subModule) => {
    dispatch({ type: 'SET_SUBMODULE', payload: subModule });
  };


  const handleUnitsUpdated = (subModuleId, units) => {
    dispatch({
      type: 'UPDATE_SUBMODULE_UNITS',
      payload: { subModuleId, units }
    });
    dispatch({ type: 'FINISH_UNITS' });
  };


return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
          Learning Management System
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Create, organize, and manage your educational content with ease
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Progress Indicator */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${formState.module ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${formState.module ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {formState.module ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>1</span>
                )}
              </div>
              <span className="ml-2 font-medium">Module</span>
            </div>

            <div className="flex-1 h-1 bg-gray-200 rounded-full">
              <div className={`h-1 rounded-full ${formState.module ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            </div>

            <div className={`flex items-center ${formState.module?.subModules?.length ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${formState.module?.subModules?.length ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {formState.module?.subModules?.length ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>2</span>
                )}
              </div>
              <span className="ml-2 font-medium">Submodules</span>
            </div>

            <div className="flex-1 h-1 bg-gray-200 rounded-full">
              <div className={`h-1 rounded-full ${formState.subModule ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            </div>

            <div className={`flex items-center ${formState.subModule ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${formState.subModule ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {formState.subModule ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>3</span>
                )}
              </div>
              <span className="ml-2 font-medium">Units</span>
            </div>

            <div className="flex-1 h-1 bg-gray-200 rounded-full">
              <div className={`h-1 rounded-full ${formState.fileData ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            </div>

            <div className={`flex items-center ${formState.fileData ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${formState.fileData ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {formState.fileData ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>4</span>
                )}
              </div>
              <span className="ml-2 font-medium">Content</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Module Creation/Display */}
          {!formState.module && !formState.isCreatingModule && (
            <div className="text-center py-12">
              <div className="mx-auto w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Start by creating a module</h3>
              <p className="text-lg text-gray-600 mb-6 max-w-lg mx-auto">
                Modules are the foundation of your learning materials. Create one to get started.
              </p>
              <button
                onClick={() => dispatch({ type: 'START_CREATING_MODULE' })}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create New Module
              </button>
            </div>
          )}

          {formState.isCreatingModule ? (
            <ModuleCreator
              onCancel={() => dispatch({ type: 'RESET' })}
              onCreate={handleModuleCreated}
            />
          ) : formState.module && (
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{formState.module.name}</h3>
                  {formState.module.description && (
                    <p className="text-gray-600">{formState.module.description}</p>
                  )}
                </div>
                {formState.module.banner && (
                  <div className="mt-4 md:mt-0 md:ml-6">
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <img src={formState.module.banner} alt="Module banner" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submodule Management */}
          {formState.module && formState.isEditingSubmodules && (
            <SubModuleTable
              module={formState.module}
              onSave={handleSubmoduleCreated}
              onCancel={() => dispatch({ type: 'CANCEL_SUBMODULES' })}
            />
          )}

          {formState.subModule && (
            formState.isEditingUnits ? (
              <UnitTable
                subModule={formState.subModule}
                onSave={(subModuleId, units) => handleUnitsUpdated(subModuleId, units)}
                onCancel={() => dispatch({ type: 'FINISH_UNITS' })}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    Units for: <span className="text-blue-600">{formState.subModule.name}</span>
                  </h3>
                  <button
                    onClick={() => dispatch({ type: 'START_EDITING_UNITS' })}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Manage Units
                  </button>
                </div>

                {formState.subModule.units?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formState.subModule.units.map(unit => (
                      <div
                        key={unit.id}
                        className={`bg-white p-5 rounded-lg border ${formState.unit?.id === unit.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'} shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer`}
                        onClick={() => dispatch({ type: 'SET_UNIT', payload: unit })}
                      >
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">{unit.name}</h3>
                        {unit.description && <p className="text-gray-600">{unit.description}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          No units added yet. Click "Manage Units" to add some.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* File Upload Section */}
          {formState.unit && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Learning Material</h3>
              <FileUploader onFileSelect={(file) => dispatch({ type: 'SET_FILE', payload: file })} />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-6 border-t border-gray-200 gap-4">
            <div>
              {formState.module && (
                <button
                  onClick={() => {
                    if (formState.unit) {
                      dispatch({ type: 'SET_UNIT', payload: null });
                    } else if (formState.subModule) {
                      dispatch({ type: 'SET_SUBMODULE', payload: null });
                    } else if (formState.isEditingSubmodules) {
                      dispatch({ type: 'RESET' });
                    }
                  }}
                  className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition duration-150"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Back
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  Swal.fire({
                    title: 'Are you sure?',
                    text: "You'll lose all your current progress.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, start over',
                    cancelButtonText: 'Cancel'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      dispatch({ type: 'RESET' });
                    }
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                Start Over
              </button>
              {formState.unit && formState.fileData && (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      Submit Content
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningMaterialManager; 