import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import axios from 'axios';

export default function NewBooking() {
  const [plots, setPlots] = useState([]);
  const [formData, setFormData] = useState({
    buyerName: '',
    address: '',
    phoneNumber: '',
    gender: 'Male',
    plotId: '',
    ratePerSqFt: 0,
    areaSqFt: 0,
    totalCost: 0,
    paymentType: 'Cash',
    brokerReference: '',
    firstPayment: 0,
  });

  useEffect(() => {
    async function fetchPlots() {
      try {
        const { data } = await axios.get('/api/plots');
        setPlots(data);
      } catch (error) {
        console.error('Error fetching plots', error);
      }
    }
    fetchPlots();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'plotId') {
      const selectedPlot = plots.find((plot) => plot._id === value);
      if (selectedPlot) {
        const totalCost = selectedPlot.areaSqFt * selectedPlot.ratePerSqFt;
        setFormData((prev) => ({
          ...prev,
          ratePerSqFt: selectedPlot.ratePerSqFt,
          areaSqFt: selectedPlot.areaSqFt,
          totalCost,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/bookings', formData);
      alert('Booking created successfully');
    } catch (error) {
      console.error('Error creating booking', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">New Booking</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="buyerName"
          value={formData.buyerName}
          onChange={handleChange}
          placeholder="Buyer Name"
          required
        />
        <Input
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address"
          required
        />
        <Input
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="Phone Number"
          required
        />

        <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => handleChange({ target: { name: 'plotId', value } })} required>
          <SelectTrigger>
            <SelectValue placeholder="Select Plot" />
          </SelectTrigger>
          <SelectContent>
            {plots.map((plot) => (
              <SelectItem key={plot._id} value={plot._id}>
                Plot {plot.plotNumber} - {plot.areaSqFt} sq ft
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input value={formData.areaSqFt} readOnly placeholder="Area (sq ft)" />
        <Input value={formData.ratePerSqFt} readOnly placeholder="Rate per sq ft" />
        <Input value={formData.totalCost} readOnly placeholder="Total Cost" />

        <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentType: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Payment Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="Cheque">Cheque</SelectItem>
            <SelectItem value="Online">Online</SelectItem>
          </SelectContent>
        </Select>

        <Input
          name="brokerReference"
          value={formData.brokerReference}
          onChange={handleChange}
          placeholder="Broker Reference (Optional)"
        />
        <Input
          name="firstPayment"
          type="number"
          value={formData.firstPayment}
          onChange={handleChange}
          placeholder="First Payment"
          required
        />

        <Button type="submit">Create Booking</Button>
      </form>
    </div>
  );
}
