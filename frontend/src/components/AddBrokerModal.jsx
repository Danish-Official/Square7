import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { apiClient } from "@/lib/utils";

function AddBrokerModal({
  open = true,
  addBrokerData,
  addBrokerErrors,
  onChange,
  onCancel,
  onAdd
}) {
  // Broker suggestions state
  const [brokerSuggestions, setBrokerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    // Fetch all brokers for suggestions
    async function fetchBrokers() {
      try {
        const { data } = await apiClient.get("/brokers");
        setBrokerSuggestions(Array.isArray(data) ? data : []);
      } catch (error) {
        setBrokerSuggestions([]);
      }
    }
    fetchBrokers();
  }, []);

  // Filter unique broker names for suggestions
  const getUniqueBrokerSuggestions = (brokers, searchTerm) => {
    const nameMap = new Map();
    return brokers
      .filter(broker =>
        broker.name && broker.name.toLowerCase().includes((searchTerm || '').toLowerCase())
      )
      .filter(broker => {
        const key = broker.name.toLowerCase();
        if (nameMap.has(key)) return false;
        nameMap.set(key, broker);
        return true;
      });
  };

  // Handle suggestion click
  const handleBrokerSelect = (broker) => {
    onChange('name', broker.name);
    onChange('phoneNumber', broker.phoneNumber || '');
    onChange('address', broker.address || '');
    setShowSuggestions(false);
  };

  // Hide suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuggestions]);

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Add Advisor</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            onAdd();
          }}
          className="space-y-4"
        >
          <div className="space-y-2 relative">
            <Label htmlFor="broker-name">Name</Label>
            <Input
              id="broker-name"
              placeholder="Name"
              value={addBrokerData.name || ''}
              onChange={e => {
                onChange('name', e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              autoComplete="off"
              aria-invalid={!!addBrokerErrors.name}
            />
            {showSuggestions && addBrokerData.name && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {getUniqueBrokerSuggestions(brokerSuggestions, addBrokerData.name).length === 0 ? (
                  <div className="px-4 py-2 text-gray-500">No matches found</div>
                ) : (
                  getUniqueBrokerSuggestions(brokerSuggestions, addBrokerData.name).map(broker => (
                    <div
                      key={broker._id}
                      className="px-4 py-2 hover:bg-[#f7f7f7] cursor-pointer text-black"
                      onClick={() => handleBrokerSelect(broker)}
                    >
                      <div className="font-medium">{broker.name}</div>
                      {broker.phoneNumber && (
                        <div className="text-xs text-gray-600">{broker.phoneNumber}</div>
                      )}
                      {broker.address && (
                        <div className="text-xs text-gray-600">{broker.address}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
            {addBrokerErrors.name && (
              <div className="text-destructive text-xs mt-1">{addBrokerErrors.name}</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="broker-phone">Phone Number</Label>
            <Input
              id="broker-phone"
              placeholder="Phone Number"
              value={addBrokerData.phoneNumber || ''}
              onChange={e => onChange('phoneNumber', e.target.value)}
              autoComplete="off"
              aria-invalid={!!addBrokerErrors.phoneNumber}
            />
            {addBrokerErrors.phoneNumber && (
              <div className="text-destructive text-xs mt-1">{addBrokerErrors.phoneNumber}</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="broker-address">Address</Label>
            <Input
              id="broker-address"
              placeholder="Address"
              value={addBrokerData.address || ''}
              onChange={e => onChange('address', e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="broker-commission">Commission Rate</Label>
            <Input
              id="broker-commission"
              placeholder="Commission Rate"
              type="number"
              value={addBrokerData.commissionRate || ''}
              onChange={e => onChange('commissionRate', e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="broker-tds">TDS %</Label>
            <Input
              id="broker-tds"
              placeholder="TDS %"
              type="number"
              value={addBrokerData.tdsPercentage || ''}
              onChange={e => onChange('tdsPercentage', e.target.value)}
              autoComplete="off"
            />
          </div>
          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddBrokerModal;