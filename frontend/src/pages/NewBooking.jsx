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
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function NewBooking() {
  const [plots, setPlots] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    buyerName: "",
    address: "",
    phoneNumber: "",
    gender: "Male",
    plotId: "",
    areaSqFt: 0,
    ratePerSqFt: 0,
    paymentType: "Cash",
    brokerReference: "",
    firstPayment: 0,
    totalCost: 0,
  });
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);

  useEffect(() => {
    async function fetchPlots() {
      try {
        const { data } = await apiClient.get("/plots/available-plots");
        setPlots(data);
      } catch (error) {
        console.error("Error fetching plots", error);
      }
    }
    fetchPlots();
  }, []);

  useEffect(() => {
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

    if (name === "ratePerSqFt") {
      setFormData((prev) => ({
        ...prev,
        totalCost: prev.areaSqFt * value,
      }));
    }
  };

  const handlePlotChange = (value) => {
    const selectedPlot = plots.find((plot) => plot._id === value);
    if (selectedPlot) {
      setFormData((prev) => ({
        ...prev,
        plotId: value, // Explicitly set plotId
        areaSqFt: selectedPlot.areaSqFt,
        totalCost: selectedPlot.areaSqFt * prev.ratePerSqFt,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookingResponse = await apiClient.post("/bookings", formData);
      const bookingId = bookingResponse.data._id;

      const invoiceData = {
        booking: bookingId,
        payments: [
          {
            amount: formData.firstPayment,
            paymentDate: new Date(),
            paymentType: formData.paymentType,
          },
        ],
      };
      await apiClient.post("/invoices", invoiceData);

      alert("Booking and invoice created successfully");
      navigate("/contact-list");
    } catch (error) {
      console.error("Error creating booking or invoice:", error);
      alert(error.response?.data?.message || "Failed to create booking");
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return (
          <div className="space-y-4">
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
                value={formData.gender}
                required
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
            <Button
              onClick={() => setCurrentSection(2)}
              disabled={!formData.buyerName || !formData.phoneNumber}
            >
              Next
            </Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plotId">Plot</Label>
              <Select
                onValueChange={handlePlotChange} // Use handlePlotChange for plot selection
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
                name="ratePerSqFt"
                type="number"
                value={formData.ratePerSqFt}
                onChange={handleChange}
                placeholder="Rate per sq ft"
                required
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
            <Button
              onClick={() => setCurrentSection(3)}
              disabled={!formData.plotId || !formData.ratePerSqFt}
            >
              Next
            </Button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, paymentType: value }))
                }
                value={formData.paymentType}
                required
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
              <Label htmlFor="brokerReference">
                Broker Reference (Optional)
              </Label>
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
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex">
      <div className="w-1/4 p-4 space-y-4 border-r">
        <button
          className={`block w-full text-left ${
            currentSection === 1 ? "font-bold" : ""
          }`}
          onClick={() => setCurrentSection(1)}
        >
          Personal Details
        </button>
        <button
          className={`block w-full text-left ${
            currentSection === 2 ? "font-bold" : ""
          }`}
          onClick={() => setCurrentSection(2)}
          disabled={!formData.buyerName || !formData.phoneNumber}
        >
          Plot Details
        </button>
        <button
          className={`block w-full text-left ${
            currentSection === 3 ? "font-bold" : ""
          }`}
          onClick={() => setCurrentSection(3)}
          disabled={!formData.plotId || !formData.ratePerSqFt}
        >
          Payment Details
        </button>
      </div>
      <div className="w-3/4 p-6">{renderSection()}</div>
    </form>
  );
}
