import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { compressImage } from '../../../../utils/compressImage';

const ModuleCreator = ({ onCreate, onCancel, existingModules = [] }) => {
  const [isCreated, setIsCreated] = useState(false);
  const [newModule, setNewModule] = useState({
    id: uuidv4(),
    name: '',
    description: '',
    banner: null
  });
  const [errors, setErrors] = useState({});
  const [isCompressing, setIsCompressing] = useState(false);

  const handleCreate = async () => {
    if (!newModule.name.trim()) {
      setErrors({ name: 'Module name is required' });
      return;
    }

    try {
      setIsCompressing(true);
      let compressedBanner = null;
      if (newModule.banner) {
        try {
          compressedBanner = await compressImage(newModule.banner);
        } catch (error) {
          console.error('Image compression failed:', error);
          compressedBanner = await convertFileToBase64(newModule.banner);
        }
      }
      const module = {
        id: Date.now(),
        name: newModule.name.trim(),
        description: newModule.description.trim(),
        banner: compressedBanner,
        subModules: [],
        createdAt: new Date().toISOString()
      };

      const moduleJSON = JSON.stringify(module, null, 2);
      console.log("Module data as JSON:", moduleJSON);

      onCreate(module);
      setIsCreated(true);
      setNewModule({ name: '', description: '', banner: null });
    } catch (error) {
      console.error('Error creating module:', error);
    } finally {
      setIsCompressing(false);
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

  if (isCreated) {
    return (
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800">Module Created Successfully!</h3>
        <div className="mt-2">
          <p><strong>Name:</strong> {newModule.name}</p>
          <p><strong>Description:</strong> {newModule.description}</p>
          {newModule.banner && (
            <div className="mt-2">
              <strong>Banner:</strong>
              <img 
                src={URL.createObjectURL(newModule.banner)} 
                alt="Module banner" 
                className="h-20 mt-2 rounded"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">Create New Module</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Introduction to React"
              className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
              value={newModule.name}
              onChange={(e) => {
                setNewModule({ ...newModule, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: null });
              }}
            />
            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              placeholder="Brief description of what this module covers..."
              className="textarea textarea-bordered w-full h-32"
              value={newModule.description}
              onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Image
            </label>
            <div className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              {newModule.banner ? (
                <>
                  <img 
                    src={URL.createObjectURL(newModule.banner)} 
                    alt="Preview" 
                    className="h-32 object-contain mb-4 rounded-lg"
                  />
                  <button
                    onClick={() => setNewModule({ ...newModule, banner: null })}
                    className="btn btn-sm btn-ghost text-red-500"
                  >
                    Remove Image
                  </button>
                </>
              ) : (
                <>
                  <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p className="text-sm text-gray-500 mb-2">Drag & drop or click to upload</p>
                  <input
                    type="file"
                    className="hidden"
                    id="module-banner-upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) setNewModule({ ...newModule, banner: file });
                    }}
                  />
                  <label 
                    htmlFor="module-banner-upload"
                    className="btn btn-sm btn-outline"
                  >
                    Select Image
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <button
            onClick={onCancel}
            className="btn btn-outline px-6"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCompressing}
            className="btn btn-primary px-6"
          >
            {isCompressing ? (
              <>
                <span className="loading loading-spinner"></span>
                Creating...
              </>
            ) : 'Create Module'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleCreator;