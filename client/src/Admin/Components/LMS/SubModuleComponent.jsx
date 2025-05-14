import React from 'react';
import SubModuleTable from './SubModuleComponents/SubModuleTable';

const SubModuleComponent = ({ module, onSave, onCancel, onSelectSubmodule }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow border-2">
      <SubModuleTable
        module={module}
        onSave={onSave}
        onCancel={onCancel}
        onSelectSubmodule={onSelectSubmodule}
      />
    </div>
  );
};

export default SubModuleComponent;