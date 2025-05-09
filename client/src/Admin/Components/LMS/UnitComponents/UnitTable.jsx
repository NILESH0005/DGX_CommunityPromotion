import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';

const UnitTable = ({ subModule, onSave, onCancel }) => {
  const [units, setUnits] = useState(subModule.units || []);
  const [newUnit, setNewUnit] = useState({
    id: uuidv4(),
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [selectedUnit, setSelectedUnit] = useState(null);

  const handleAddUnit = () => {
    if (!newUnit.name.trim()) {
      setErrors({ name: 'Unit name is required' });
      return;
    }

    const unitToAdd = {
      id: newUnit.id,
      name: newUnit.name.trim(),
      description: newUnit.description.trim()
    };

    setUnits([...units, unitToAdd]);
    resetNewUnitForm();
  };

  const handleUpdateUnit = () => {
    if (!newUnit.name.trim()) {
      setErrors({ name: 'Unit name is required' });
      return;
    }

    const updatedUnits = units.map(unit => 
      unit.id === selectedUnit.id ? { 
        ...newUnit, 
        name: newUnit.name.trim(),
        description: newUnit.description.trim()
      } : unit
    );

    setUnits(updatedUnits);
    resetNewUnitForm();
  };

  const resetNewUnitForm = () => {
    setNewUnit({
      id: uuidv4(),
      name: '',
      description: ''
    });
    setErrors({});
    setSelectedUnit(null);
  };

  const handleEditUnit = (unit) => {
    setSelectedUnit(unit);
    setNewUnit({
      id: unit.id,
      name: unit.name,
      description: unit.description
    });
  };

  const handleRemoveUnit = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setUnits(units.filter(unit => unit.id !== id));
        if (selectedUnit?.id === id) {
          resetNewUnitForm();
        }
      }
    });
  };

  const handleSaveAll = () => {
    if (units.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Units',
        text: 'Please add at least one unit',
      });
      return;
    }
    
    onSave(subModule.id, units);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          Managing Units for: <span className="text-primary">{subModule.name}</span>
        </h3>
        <div className="badge badge-lg badge-primary">
          {units.length} {units.length === 1 ? 'Unit' : 'Units'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Units List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr className="bg-primary text-primary-content">
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr 
                    key={unit.id} 
                    className={`hover:bg-gray-50 ${selectedUnit?.id === unit.id ? 'bg-blue-50' : ''}`}
                  >
                    <td>{unit.name}</td>
                    <td className="max-w-xs truncate">
                      {unit.description || 'No description'}
                    </td>
                    <td className="flex space-x-2">
                      <button
                        onClick={() => handleEditUnit(unit)}
                        className="btn btn-xs btn-info"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveUnit(unit.id)}
                        className="btn btn-xs btn-error"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Unit Form */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h4 className="card-title">
              {selectedUnit ? 'Edit Unit' : 'Add New Unit'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Unit Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Introduction to React"
                  className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                  value={newUnit.name}
                  onChange={(e) => {
                    setNewUnit({...newUnit, name: e.target.value});
                    if (errors.name) setErrors({...errors, name: null});
                  }}
                />
                {errors.name && (
                  <div className="label">
                    <span className="label-text-alt text-error">{errors.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  placeholder="What will students learn in this unit?"
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  value={newUnit.description}
                  onChange={(e) => setNewUnit({...newUnit, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={resetNewUnitForm}
                  className="btn btn-outline"
                >
                  {selectedUnit ? 'Cancel' : 'Clear'}
                </button>
                {selectedUnit ? (
                  <button
                    onClick={handleUpdateUnit}
                    className="btn btn-primary"
                  >
                    Update Unit
                  </button>
                ) : (
                  <button
                    onClick={handleAddUnit}
                    className="btn btn-primary"
                  >
                    Add Unit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save/Cancel Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onCancel}
          className="btn btn-outline"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveAll}
          className="btn btn-primary"
          disabled={units.length === 0}
        >
          Save All Units
        </button>
      </div>
    </div>
  );
};

export default UnitTable;