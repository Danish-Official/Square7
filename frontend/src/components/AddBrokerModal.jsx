// Move this outside of the main component (e.g., App, BookingPage, etc.)
const AddBrokerModal = ({
  addBrokerData,
  addBrokerErrors,
  onChange,
  onCancel,
  onAdd
}) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Add Advisor</h2>
      <div className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Name"
          value={addBrokerData.name || ''}
          onChange={e => onChange('name', e.target.value)}
          autoComplete="off"
        />
        {addBrokerErrors.name && <div className="text-red-500 text-sm">{addBrokerErrors.name}</div>}
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Phone Number"
          value={addBrokerData.phoneNumber || ''}
          onChange={e => onChange('phoneNumber', e.target.value)}
          autoComplete="off"
        />
        {addBrokerErrors.phoneNumber && <div className="text-red-500 text-sm">{addBrokerErrors.phoneNumber}</div>}
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Address"
          value={addBrokerData.address || ''}
          onChange={e => onChange('address', e.target.value)}
          autoComplete="off"
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Commission Rate (per booking)"
          type="number"
          value={addBrokerData.commissionRate || ''}
          onChange={e => onChange('commissionRate', e.target.value)}
          autoComplete="off"
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="TDS Percentage (per booking)"
          type="number"
          value={addBrokerData.tdsPercentage || ''}
          onChange={e => onChange('tdsPercentage', e.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          onClick={onCancel}
        >Cancel</button>
        <button
          className="px-4 py-2 rounded bg-[#1F263E] text-white hover:bg-[#232b47]"
          onClick={onAdd}
        >Add</button>
      </div>
    </div>
  </div>
);
export default AddBrokerModal;