import React, { useState, useReducer, useContext } from 'react';
import ApiContext from '../../../context/ApiContext';
import Swal from "sweetalert2";
import UnitSelector from './UnitComponents/UnitSelector';
import FileUploader from './FileUploader';
import ModuleCreator from './ModuleComponents/ModuleCreator';
import SubModuleTable from './SubModuleComponents/SubModuleTable'; // New component

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
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Learning Managemenet System</h2>
        <p className="text-gray-600">Create and organize your educational content</p>
      </div>

      {/* Progress Steps */}
      {/* <div className="steps steps-horizontal mb-8">
        <div className={`step ${formState.module ? 'step-primary' : ''}`}>
          <div className="step-circle">1</div>
          <div className="step-title">Module</div>
        </div>
        <div className={`step ${formState.module?.subModules?.length ? 'step-primary' : ''}`}>
          <div className="step-circle">2</div>
          <div className="step-title">Submodules</div>
        </div>
        <div className={`step ${formState.subModule ? 'step-primary' : ''}`}>
          <div className="step-circle">3</div>
          <div className="step-title">Units</div>
        </div>
        <div className={`step ${formState.fileData ? 'step-primary' : ''}`}>
          <div className="step-circle">4</div>
          <div className="step-title">Content</div>
        </div>
      </div> */}

      <div className="space-y-8 bg-white p-6 rounded-lg shadow-sm">
        {/* Module Creation/Display */}
        {!formState.module && !formState.isCreatingModule && (
          <div className="text-center py-8">
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Start by creating a module</h3>
            <p className="text-gray-600 mb-4">Modules help organize your learning materials</p>
            <button
              onClick={() => dispatch({ type: 'START_CREATING_MODULE' })}
              className="btn btn-primary btn-lg"
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
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="card-title text-xl">{formState.module.name}</h3>
                  {formState.module.description && (
                    <p className="text-gray-600 mt-1">{formState.module.description}</p>
                  )}
                </div>
                {formState.module.banner && (
                  <div className="avatar">
                    <div className="w-16 rounded-lg">
                      <img src={formState.module.banner} alt="Module banner" />
                    </div>
                  </div>
                )}
              </div>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Units for: {formState.subModule.name}
                </h3>
                <button
                  onClick={() => dispatch({ type: 'START_EDITING_UNITS' })}
                  className="btn btn-primary btn-sm"
                >
                  Manage Units
                </button>
              </div>

              {formState.subModule.units?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formState.subModule.units.map(unit => (
                    <div
                      key={unit.id}
                      className={`card bg-base-100 shadow cursor-pointer hover:bg-gray-50 ${formState.unit?.id === unit.id ? 'ring-2 ring-primary' : ''
                        }`}
                      onClick={() => dispatch({ type: 'SET_UNIT', payload: unit })}
                    >
                      <div className="card-body">
                        <h3 className="card-title">{unit.name}</h3>
                        {unit.description && <p>{unit.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info">
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>No units added yet. Click "Manage Units" to add some.</span>
                  </div>
                </div>
              )}
            </div>
          )
        )}
        <div className="flex justify-between pt-6 border-t">
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
                className="btn btn-ghost"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Start Over
            </button>
            {formState.unit && formState.fileData && (
              <button
                onClick={handleSubmit}
                className="btn btn-primary px-8"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Uploading Content...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
};

export default LearningMaterialManager;