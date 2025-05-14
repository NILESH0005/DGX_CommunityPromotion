import React from 'react';
import ModuleCreator from './ModuleComponents/ModuleCreator';

const ModuleComponent = ({ mode, module, onCreateModule, onManageSubmodules, onCreate, onCancel }) => {
  if (mode === 'empty') {
    return (
      <div className="text-center py-8 bg-white p-6 rounded-lg shadow border-2">
        <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Start by creating a module</h3>
        <p className="text-gray-600 mb-4">Modules help organize your learning materials</p>
        <button
          onClick={onCreateModule}
          className="px-4 py-2 bg-DGXblue text-white rounded-md hover:bg-blue-600 transition"
        >
          Create New Module
        </button>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="bg-white p-6 rounded-lg shadow border-2">
        <ModuleCreator
          onCancel={onCancel}
          onCreate={onCreate}
        />
      </div>
    );
  }

  if (mode === 'view') {
    return (
      <div className="bg-white p-6 rounded-lg shadow border-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{module.name}</h3>
            {module.description && (
              <p className="text-gray-600">{module.description}</p>
            )}
          </div>
          {module.banner && (
            <div className="w-16 h-16 rounded-lg overflow-hidden border">
              <img
                src={module.banner}
                alt="Module banner"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t">
          <button
            onClick={onManageSubmodules}
            className="px-4 py-2 bg-DGXblue text-white rounded-md hover:bg-blue-600 transition"
          >
            Manage Submodules
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ModuleComponent;