import React, { useState } from "react";
import Swal from 'sweetalert2';

const AddUnitModal = ({ isOpen, onClose, onAddUnit, submodule, fetchData, userToken }) => {
    const [unitData, setUnitData] = useState({
        UnitName: '',
        UnitDescription: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUnitData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
        const payload = {
            ...unitData,
            SubModuleID: submodule.SubModuleID
        };

        const response = await fetchData(
            `lmsEdit/addUnit`,
            "POST",
            payload,
            {
                'Content-Type': 'application/json',
                'auth-token': userToken
            }
        );

        if (response?.success) {
            Swal.fire('Success!', 'Unit added successfully', 'success');
            
            // Create a complete unit object with all required fields
            const completeUnit = {
                UnitID: response.data?.UnitID || Date.now(), // Use temporary ID if not provided
                UnitName: unitData.UnitName,
                UnitDescription: unitData.UnitDescription,
                SubModuleID: submodule.SubModuleID,
                // Add any other default fields your application expects
                files: [],
                delStatus: 0
            };

            onAddUnit(completeUnit);
            onClose();
            setUnitData({ UnitName: '', UnitDescription: '' });
        } else {
            throw new Error(response?.message || "Failed to add unit");
        }
    } catch (err) {
        console.error("Error:", err);
        setError(err.message);
    } finally {
        setIsSubmitting(false);
    }
};

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Add New Unit</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="UnitName" className="block text-sm font-medium text-gray-700">
                            Unit Name
                        </label>
                        <input
                            type="text"
                            id="UnitName"
                            name="UnitName"
                            value={unitData.UnitName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="UnitDescription" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="UnitDescription"
                            name="UnitDescription"
                            rows={3}
                            value={unitData.UnitDescription}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding...
                                </>
                            ) : 'Add Unit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUnitModal;