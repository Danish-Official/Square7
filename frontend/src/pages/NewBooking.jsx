import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; // Import Label component
import { apiClient } from "@/lib/utils";

export default function NewBooking() {
  const [plots, setPlots] = useState(null);
  const [formData, setFormData] = useState({
    buyerName: "",
    address: "",
    phoneNumber: "",
    gender: "Male",
    plotId: "",
    ratePerSqFt: 0,
    areaSqFt: 0,
    paymentType: "Cash",
    brokerReference: "",
    firstPayment: 0,
    totalCost: 0,
  });
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    async function fetchPlots() {
      try {
        const { data } = await apiClient.get("/plots/available-plots"); // Fetch only available plots
        setPlots(data);
      } catch (error) {
        console.error("Error fetching plots", error);
      }
    }
    fetchPlots();
  }, []);

  useEffect(() => {
    // Check if the form is valid
    const hasErrors = Object.values(errors).some((error) => error !== "");
    setIsFormValid(
      !hasErrors &&
        formData.buyerName &&
        formData.phoneNumber &&
        formData.firstPayment > 0
    );
  }, [errors, formData]);

  const validateField = (name, value) => {
    let error = "";
    if (name === "buyerName") {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(value)) {
        error = "Buyer name should contain only alphabets.";
      }
    } else if (name === "phoneNumber") {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(value)) {
        error = "Phone number should be exactly 10 digits.";
      }
    } else if (name === "firstPayment") {
      if (value <= 0 || value > formData.totalCost) {
        error =
          "First payment should be greater than 0 and less than or equal to the total cost.";
      }
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);

    if (name === "plotId") {
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
      await apiClient.post("/bookings", formData); // Ensure relative path
      alert("Booking created successfully");
    } catch (error) {
      console.error("Error creating booking", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">New Booking</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="buyerName">Buyer Name</Label>
          <Input
            id="buyerName"
            name="buyerName"
            value={formData.buyerName}
            onChange={handleChange}
            placeholder="Buyer Name"
            required
          />
          {errors.buyerName && (
            <p className="text-red-500 text-sm">{errors.buyerName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            required
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, gender: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="plotId">Plot</Label>
          <Select
            onValueChange={(value) =>
              handleChange({ target: { name: "plotId", value } })
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Plot" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(plots) &&
                plots.map((plot) => (
                  <SelectItem key={plot._id} value={plot._id}>
                    Plot {plot.plotNumber} - {plot.areaSqFt} sq ft
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="areaSqFt">Area (sq ft)</Label>
          <Input
            id="areaSqFt"
            value={formData.areaSqFt}
            readOnly
            placeholder="Area (sq ft)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ratePerSqFt">Rate per sq ft</Label>
          <Input
            id="ratePerSqFt"
            value={formData.ratePerSqFt}
            readOnly
            placeholder="Rate per sq ft"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalCost">Total Cost</Label>
          <Input
            id="totalCost"
            value={formData.totalCost}
            readOnly
            placeholder="Total Cost"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentType">Payment Type</Label>
          <Select
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, paymentType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Payment Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Cheque">Cheque</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brokerReference">Broker Reference (Optional)</Label>
          <Input
            id="brokerReference"
            name="brokerReference"
            value={formData.brokerReference}
            onChange={handleChange}
            placeholder="Broker Reference (Optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstPayment">First Payment</Label>
          <Input
            id="firstPayment"
            name="firstPayment"
            type="number"
            value={formData.firstPayment}
            onChange={handleChange}
            placeholder="First Payment"
            required
          />
          {errors.firstPayment && (
            <p className="text-red-500 text-sm">{errors.firstPayment}</p>
          )}
        </div>

        <Button type="submit" disabled={!isFormValid}>
          Create Booking
        </Button>
      </form>
    </div>
  );
}
