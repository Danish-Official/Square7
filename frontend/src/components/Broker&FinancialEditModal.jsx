import React, { useState, useEffect } from 'react';

/**
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - editedData: object (fields: name, phoneNumber, address, commissionRate, tdsPercentage)
 * - handleEditChange: function(field, value)
 * - handleSave: function()
 * - errors: object
 * - isAdmin: boolean
 */
export const BrokerAndFinancialEditModal = ({
  isOpen,
  onClose,
  editedData = {},
  handleEditChange,
  handleSave,
  errors = {},
  isAdmin = false
}) => {
  const [localData, setLocalData] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    commissionRate: '',
    tdsPercentage: '',
  });

  useEffect(() => {
    setLocalData({
      name: editedData.name || '',
      phoneNumber: editedData.phoneNumber || '',
      address: editedData.address || '',
      commissionRate: editedData.commissionRate || '',
      tdsPercentage: editedData.tdsPercentage || '',
    });
  }, [editedData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalData((prev) => ({ ...prev, [name]: value }));
    if (handleEditChange) handleEditChange(name, value);
  };


  // Only send fields that have been changed (non-empty and different from original)
  const onSave = (e) => {
    e.preventDefault();
    if (!handleSave) return;

    // Build an object with only changed fields (non-empty and different from editedData)
    const changedFields = {};
    Object.keys(localData).forEach((key) => {
      // Only include if not empty and different from original
      if (
        localData[key] !== '' &&
        (editedData[key] === undefined || localData[key] !== editedData[key])
      ) {
        changedFields[key] = localData[key];
      }
    });
    handleSave(changedFields);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-xl font-semibold mb-4 text-center">Edit Advisor & Financials</h2>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={localData.name}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-3 py-2"
              disabled={!isAdmin}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={localData.phoneNumber}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-3 py-2"
              disabled={!isAdmin}
            />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={localData.address}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-3 py-2"
              disabled={!isAdmin}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Commission Rate (per sq ft)</label>
            <input
              type="number"
              name="commissionRate"
              value={localData.commissionRate}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-3 py-2"
              min="0"
              step="0.01"
            />
            {errors.commissionRate && <p className="text-red-500 text-xs mt-1">{errors.commissionRate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">TDS %</label>
            <input
              type="number"
              name="tdsPercentage"
              value={localData.tdsPercentage}
              onChange={handleChange}
              className="mt-1 block w-full border rounded px-3 py-2"
              min="0"
              max="100"
              step="0.01"
            />
            {errors.tdsPercentage && <p className="text-red-500 text-xs mt-1">{errors.tdsPercentage}</p>}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#1F263E] text-white rounded hover:bg-[#232b47]"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
