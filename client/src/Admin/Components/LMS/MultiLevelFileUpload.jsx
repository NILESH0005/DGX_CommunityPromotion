import React, { useState, useReducer, useContext } from 'react';
import ApiContext from '../../../context/ApiContext';
import Swal from "sweetalert2";



const initialModules = [
  {
    id: 1,
    name: 'Mathematics',
    description: 'Math concepts and formulas',
    banner: null,
    subModules: [
      {
        id: 101,
        name: 'Algebra',
        description: 'Linear equations and polynomials',
        banner: null,
        units: [
          { id: 1001, name: 'Linear Equations' },
          { id: 1002, name: 'Quadratic Equations' }
        ]
      },
      {
        id: 102,
        name: 'Calculus',
        description: 'Derivatives and integrals',
        banner: null,
        units: [
          { id: 1003, name: 'Limits' },
          { id: 1004, name: 'Derivatives' }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'Physics',
    description: 'Fundamental physics principles',
    banner: null,
    subModules: [
      {
        id: 201,
        name: 'Mechanics',
        description: 'Motion and forces',
        banner: null,
        units: [
          { id: 2001, name: 'Newton\'s Laws' },
          { id: 2002, name: 'Kinematics' }
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'Computer Science',
    description: 'Programming and algorithms',
    banner: null,
    subModules: []
  }
];

const formReducer = (state, action) => {
  switch (action.type) {
    case 'SET_MODULE':
      return {
        ...state,
        module: action.payload,
        subModule: null,
        unit: null,
        fileData: null
      };
    case 'SET_SUBMODULE':
      return {
        ...state,
        subModule: action.payload,
        unit: null,
        fileData: null
      };
    case 'SET_UNIT':
      return { ...state, unit: action.payload };
    case 'SET_FILE':
      return { ...state, fileData: action.payload };
    case 'RESET':
      return { module: null, subModule: null, unit: null, fileData: null };
    default:
      return state;
  }
};

const MultiLevelFileUploadSinglePage = () => {
  const { userToken, fetchData } = useContext(ApiContext);
  const [moduleList, setModuleList] = useState(initialModules);
  const [formState, dispatch] = useReducer(formReducer, {
    module: null,
    subModule: null,
    unit: null,
    fileData: null
  });
  const [newModule, setNewModule] = useState({
    name: '',
    description: '',
    banner: null
  });
  const [newSubModule, setNewSubModule] = useState({
    name: '',
    description: '',
    banner: null
  });
  const [newUnit, setNewUnit] = useState('');
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [isCreatingSubModule, setIsCreatingSubModule] = useState(false);
  const [isCreatingUnit, setIsCreatingUnit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('upload');

  const validate = () => {
    const newErrors = {};

    if (!formState.module) {
      newErrors.module = 'Please select or create a module';
    }

    if (formState.module && !formState.subModule?.name) {
      newErrors.subModule = 'Sub-module name is required';
    }

    if (formState.subModule?.name && !formState.unit?.name) {
      newErrors.unit = 'Unit name is required';
    }

    if (!formState.fileData) {
      newErrors.file = 'Please upload a file';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateNewModule = () => {
    if (!newModule.name.trim()) {
      setErrors({ ...errors, newModule: 'Module name is required' });
      return;
    }

    const newMod = {
      id: Date.now(),
      name: newModule.name.trim(),
      description: newModule.description.trim(),
      banner: newModule.banner,
      subModules: []
    };

    setModuleList(prev => [...prev, newMod]);
    dispatch({ type: 'SET_MODULE', payload: newMod });
    setNewModule({ name: '', description: '', banner: null });
    setIsCreatingModule(false);
    setErrors({ ...errors, newModule: null });
  };

  const handleCreateSubModule = () => {
    if (!newSubModule.name.trim()) {
      setErrors({ ...errors, newSubModule: 'Sub-module name is required' });
      return;
    }

    const newSubMod = {
      id: Date.now(),
      name: newSubModule.name.trim(),
      description: newSubModule.description.trim(),
      banner: newSubModule.banner,
      units: []
    };

    const updatedModules = moduleList.map(mod => {
      if (mod.id === formState.module.id) {
        return {
          ...mod,
          subModules: [...mod.subModules, newSubMod]
        };
      }
      return mod;
    });

    setModuleList(updatedModules);
    dispatch({ type: 'SET_SUBMODULE', payload: newSubMod });
    setNewSubModule({ name: '', description: '', banner: null });
    setIsCreatingSubModule(false);
    setErrors({ ...errors, newSubModule: null });
  };

  const handleCreateUnit = () => {
    if (!newUnit.trim()) {
      setErrors({ ...errors, newUnit: 'Unit name is required' });
      return;
    }

    const newUnitObj = {
      id: Date.now(),
      name: newUnit.trim()
    };

    const updatedModules = moduleList.map(mod => {
      if (mod.id === formState.module.id) {
        return {
          ...mod,
          subModules: mod.subModules.map(subMod => {
            if (subMod.id === formState.subModule.id) {
              return {
                ...subMod,
                units: [...subMod.units, newUnitObj]
              };
            }
            return subMod;
          })
        };
      }
      return mod;
    });

    setModuleList(updatedModules);
    dispatch({ type: 'SET_UNIT', payload: newUnitObj });
    setNewUnit('');
    setIsCreatingUnit(false);
    setErrors({ ...errors, newUnit: null });
  };

  const handleFileChange = (e, field, setter) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, [field]: 'File size must be less than 5MB' });
      return;
    }
    setter(file);
    setErrors({ ...errors, [field]: null });
  };

  // const handleSubmit = async () => {
  //   if (!validate()) return;
  //   setIsSubmitting(true);

  //   try {
  //     const formData = new FormData();
  //     formData.append('file', formState.fileData);
  //     formData.append('moduleId', formState.module.id);
  //     formData.append('moduleName', formState.module.name);

  //     if (formState.subModule) {
  //       formData.append('subModuleId', formState.subModule.id);
  //       formData.append('subModuleName', formState.subModule.name);
  //     }

  //     if (formState.unit) {
  //       formData.append('unitId', formState.unit.id);
  //       formData.append('unitName', formState.unit.name);
  //     }
  //     const result = await fetchData(
  //       'lms/api/upload-learning-material',  
  //       'POST',
  //       formData,
  //       {
  //         'auth-token': userToken
  //       }
  //     );

  //     if (result.success) {
  //       alert('Learning material uploaded successfully!');
  //       dispatch({ type: 'RESET' });
  //     } else {
  //       throw new Error(result.message || 'Upload failed');
  //     }
  //   } catch (error) {
  //     console.error('Upload error:', error);
  //     alert(`Error: ${error.message}`);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };


  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('file', formState.fileData);
      formData.append('moduleId', formState.module.id);
      formData.append('unitId', formState.unit.id); // Required by backend

      // Optional fields
      if (formState.subModule) {
        formData.append('subModuleId', formState.subModule.id);
      }

      const response = await fetch('http://localhost:8000/lms/api/upload-learning-material', {
        method: 'POST',
        headers: {
          'auth-token': userToken
        },
        body: formData
      });

      const result = await response.json();


      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Upload Successful!',
          text: `${formState.fileData.name} has been uploaded`,
          timer: 2000
        });
        dispatch({ type: 'RESET' });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };



  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">Learning Material Management</h2>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-gray-100 mb-6">
        <button
          className={`tab ${activeTab === 'upload' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Content
        </button>
        <button
          className={`tab ${activeTab === 'browse' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Structure
        </button>
      </div>

      {activeTab === 'upload' ? (
        <div className="space-y-6">
          {/* MODULE SECTION */}
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title text-lg">1. Select Module</h3>
              {errors.module && <p className="text-red-500 text-sm">{errors.module}</p>}

              {!isCreatingModule ? (
                <>
                  <select
                    className="select select-bordered w-full"
                    onChange={(e) => {
                      const selected = moduleList.find(mod => mod.id.toString() === e.target.value);
                      dispatch({ type: 'SET_MODULE', payload: selected || null });
                    }}
                    value={formState.module?.id || ''}
                  >
                    <option value="">-- Select Existing Module --</option>
                    {moduleList.map(mod => (
                      <option key={mod.id} value={mod.id}>
                        {mod.name}
                      </option>
                    ))}
                  </select>

                  <button
                    className="btn btn-outline w-full mt-2"
                    onClick={() => setIsCreatingModule(true)}
                  >
                    + Create New Module
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  {errors.newModule && <p className="text-red-500 text-sm">{errors.newModule}</p>}

                  <input
                    type="text"
                    placeholder="Module Name *"
                    className="input input-bordered w-full"
                    value={newModule.name}
                    onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                  />

                  <textarea
                    placeholder="Module Description"
                    className="textarea textarea-bordered w-full"
                    value={newModule.description}
                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                  />

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Module Banner (Optional)</span>
                    </label>
                    <input
                      type="file"
                      className="file-input file-input-bordered w-full"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'newModuleBanner', (file) =>
                        setNewModule({ ...newModule, banner: file })
                      )
                      }
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleCreateNewModule}
                      className="btn btn-primary flex-1"
                    >
                      Save Module
                    </button>
                    <button
                      onClick={() => setIsCreatingModule(false)}
                      className="btn btn-outline flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SUBMODULE SECTION */}
          {formState.module && (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title text-lg">2. Select Sub-Module</h3>
                {errors.subModule && <p className="text-red-500 text-sm">{errors.subModule}</p>}

                {!isCreatingSubModule ? (
                  <>
                    {formState.module.subModules.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {formState.module.subModules.map(subMod => (
                          <div
                            key={subMod.id}
                            className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${formState.subModule?.id === subMod.id ? 'border-primary bg-primary/10' : ''}`}
                            onClick={() => dispatch({
                              type: 'SET_SUBMODULE',
                              payload: subMod
                            })}
                          >
                            <h4 className="font-medium">{subMod.name}</h4>
                            {subMod.description && (
                              <p className="text-sm text-gray-600">{subMod.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No sub-modules available</p>
                    )}

                    <button
                      className="btn btn-outline w-full mt-2"
                      onClick={() => setIsCreatingSubModule(true)}
                    >
                      + Create New Sub-Module
                    </button>
                  </>
                ) : (
                  <div className="space-y-4">
                    {errors.newSubModule && <p className="text-red-500 text-sm">{errors.newSubModule}</p>}

                    <input
                      type="text"
                      placeholder="Sub-Module Name *"
                      className="input input-bordered w-full"
                      value={newSubModule.name}
                      onChange={(e) => setNewSubModule({ ...newSubModule, name: e.target.value })}
                    />

                    <textarea
                      placeholder="Sub-Module Description"
                      className="textarea textarea-bordered w-full"
                      value={newSubModule.description}
                      onChange={(e) => setNewSubModule({ ...newSubModule, description: e.target.value })}
                    />

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Sub-Module Banner (Optional)</span>
                      </label>
                      <input
                        type="file"
                        className="file-input file-input-bordered w-full"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'newSubModuleBanner', (file) =>
                          setNewSubModule({ ...newSubModule, banner: file })
                        )
                        }
                      />
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={handleCreateSubModule}
                        className="btn btn-primary flex-1"
                      >
                        Save Sub-Module
                      </button>
                      <button
                        onClick={() => setIsCreatingSubModule(false)}
                        className="btn btn-outline flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {formState.subModule && (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title text-lg">3. Select Unit</h3>
                {errors.unit && <p className="text-red-500 text-sm">{errors.unit}</p>}

                {!isCreatingUnit ? (
                  <>
                    {formState.subModule.units.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {formState.subModule.units.map(unit => (
                          <div
                            key={unit.id}
                            className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${formState.unit?.id === unit.id ? 'border-primary bg-primary/10' : ''}`}
                            onClick={() => dispatch({
                              type: 'SET_UNIT',
                              payload: unit
                            })}
                          >
                            <h4 className="font-medium">{unit.name}</h4>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No units available</p>
                    )}

                    <button
                      className="btn btn-outline w-full mt-2"
                      onClick={() => setIsCreatingUnit(true)}
                    >
                      + Create New Unit
                    </button>
                  </>
                ) : (
                  <div className="space-y-4">
                    {errors.newUnit && <p className="text-red-500 text-sm">{errors.newUnit}</p>}

                    <input
                      type="text"
                      placeholder="Unit Name *"
                      className="input input-bordered w-full"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                    />

                    <div className="flex space-x-2">
                      <button
                        onClick={handleCreateUnit}
                        className="btn btn-primary flex-1"
                      >
                        Save Unit
                      </button>
                      <button
                        onClick={() => setIsCreatingUnit(false)}
                        className="btn btn-outline flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FILE UPLOAD SECTION */}
          {formState.unit && (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title text-lg">4. Upload File</h3>
                {errors.file && <p className="text-red-500 text-sm">{errors.file}</p>}
                <input
                  type="file"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      dispatch({ type: 'SET_FILE', payload: file });
                    }
                  }}
                />
                {formState.fileData && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded w-12">
                          <span className="text-xs">{formState.fileData.name.split('.').pop()}</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{formState.fileData.name}</p>
                        <p className="text-sm text-gray-500">
                          {(formState.fileData.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="btn btn-outline"
            >
              Reset
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-primary px-6"
              disabled={isSubmitting || !formState.module || !formState.fileData}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Submitting...
                </>
              ) : 'Submit Content'}
            </button>
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title text-lg">Course Structure</h3>

            <div className="space-y-4">
              {moduleList.map(module => (
                <div key={module.id} className="collapse collapse-plus bg-base-200">
                  <input type="checkbox" defaultChecked={formState.module?.id === module.id} />
                  <div className="collapse-title text-lg font-medium">
                    {module.name}
                  </div>
                  <div className="collapse-content">
                    {module.subModules.length > 0 ? (
                      module.subModules.map(subModule => (
                        <div key={subModule.id} className="ml-4 mt-2 collapse collapse-plus bg-base-100">
                          <input type="checkbox" />
                          <div className="collapse-title font-medium">
                            {subModule.name}
                          </div>
                          <div className="collapse-content">
                            {subModule.units.length > 0 ? (
                              <ul className="ml-4 space-y-1">
                                {subModule.units.map(unit => (
                                  <li key={unit.id} className="py-1">
                                    {unit.name}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500 ml-4">No units</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 ml-4">No sub-modules</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiLevelFileUploadSinglePage;