import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleCheck } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/utils";

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
  const [currentSection, setCurrentSection] = useState(1);
  const [isSectionComplete, setIsSectionComplete] = useState(false);
  const [completedSections, setCompletedSections] = useState([]);

  useEffect(() => {
    async function fetchPlots() {
      try {
        const { data } = await apiClient.get("/plots/available-plots");
        setPlots(data);
      } catch (error) {
        toast.error("Failed to fetch available plots");
        setPlots([]);
      }
    }
    fetchPlots();
  }, []);

  useEffect(() => {
    Object.values(errors).some((error) => error !== "");
  }, [errors, formData]);

  useEffect(() => {
    let complete = true;
    if (currentSection === 1) {
      complete = formData.buyerName && formData.phoneNumber;
    } else if (currentSection === 2) {
      complete = formData.plotId && formData.ratePerSqFt;
    } else if (currentSection === 3) {
      complete = formData.firstPayment > 0;
    }
    setIsSectionComplete(complete);
  }, [currentSection, formData]);

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
    e.preventDefault(); // Ensure default form submission is prevented
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

      toast.success("Booking and invoice created successfully"); // Show success toast
      navigate("/contact-list");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create booking"); // Show error toast
    }
  };

  const isCurrentSectionValid = () => {
    switch (currentSection) {
      case 1:
        return formData.buyerName && formData.phoneNumber;
      case 2:
        return formData.plotId && formData.ratePerSqFt;
      case 3:
        return formData.firstPayment > 0;
      default:
        return false;
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return (
          <div className="space-y-4">
            <h3>Personal Details</h3>
            <div className="space-y-2">
              <Label htmlFor="buyerName">Buyer Name</Label>
              <Input
                id="buyerName"
                name="buyerName"
                value={formData.buyerName}
                onChange={handleChange}
                placeholder="Buyer Name"
                required
                className="bg-white text-black"
              />
              {errors.buyerName && (
                <p className="text-red-500 text-sm">{errors.buyerName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                required
                className="bg-white text-black w-full p-2 rounded-md border"
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
                className="bg-white text-black"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <div className="flex items-center space-x-4 bg-white p-2 rounded-md text-black justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={formData.gender === "Male"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className="form-radio"
                  />
                  <span>Male</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={formData.gender === "Female"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className="form-radio"
                  />
                  <span>Female</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="gender"
                    value="Other"
                    checked={formData.gender === "Other"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className="form-radio"
                  />
                  <span>Other</span>
                </label>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3>Plot Details</h3>
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="plotId">Plot</Label>
                <Select
                  onValueChange={handlePlotChange} // Use handlePlotChange for plot selection
                  value={formData.plotId} // Bind the selected value to formData.plotId
                  required
                >
                  <SelectTrigger className="bg-white text-black w-full">
                    {" "}
                    {/* Added w-full */}
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
              <div className="flex-1 space-y-2">
                <Label htmlFor="areaSqMt">Area (sq mt)</Label>
                <Input
                  id="areaSqMt"
                  value={
                    formData.areaSqFt
                      ? (formData.areaSqFt / 10.764).toFixed(2)
                      : ""
                  } // Show empty if 0
                  readOnly
                  placeholder="Area (sq mt)"
                  className="bg-white text-black"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="areaSqFt">Area (sq ft)</Label>
                <Input
                  id="areaSqFt"
                  value={formData.areaSqFt || ""} // Show empty if 0
                  readOnly
                  placeholder="Area (sq ft)"
                  className="bg-white text-black"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="ratePerSqFt">Rate per sq ft</Label>
                <Input
                  id="ratePerSqFt"
                  name="ratePerSqFt"
                  type="number"
                  value={formData.ratePerSqFt || ""} // Show empty if 0
                  onChange={handleChange}
                  placeholder="Rate per sq ft"
                  required
                  className="bg-white text-black"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalCost">Total Cost</Label>
              <Input
                id="totalCost"
                value={formData.totalCost || ""} // Show empty if 0
                readOnly
                placeholder="Total Cost"
                className="bg-white text-black"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3>Payment Details</h3>
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, paymentType: value }))
                }
                value={formData.paymentType}
                required
              >
                <SelectTrigger className="w-full bg-white text-black">
                  {" "}
                  {/* Added bg-white */}
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
                className="bg-white text-black"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstPayment">First Payment</Label>
              <Input
                id="firstPayment"
                name="firstPayment"
                type="number"
                value={formData.firstPayment || ""} // Show empty if 0
                onChange={handleChange}
                placeholder="First Payment"
                required
                className="bg-white text-black"
              />
              {errors.firstPayment && (
                <p className="text-red-500 text-sm">{errors.firstPayment}</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4 mx-8 mt-8 p-6"
    >
      <div className="flex space-x-4">
        <div className="w-1/4 p-4 border-r bg-[#303750] text-white shadow-md rounded-md flex flex-col gap-y-8">
          <h3 className="text-lg font-bold text-center">Quick Navigation</h3>
          <button
            className={`flex items-center justify-between w-full text-center py-4 px-4 bg-white text-black rounded-md ${
              currentSection === 1 ? "font-bold" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentSection(1);
            }}
          >
            <span>Personal Details</span>
            {completedSections.includes(1) && (
              <CircleCheck color="#1f263e" strokeWidth={1.25} />
            )}
          </button>
          <button
            className={`flex items-center justify-between w-full text-center py-4 px-4 bg-white text-black rounded-md ${
              currentSection === 2 ? "font-bold" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentSection(2);
            }}
            disabled={!formData.buyerName || !formData.phoneNumber}
          >
            <span>Plot Details</span>
            {completedSections.includes(2) && (
              <CircleCheck color="#1f263e" strokeWidth={1.25} />
            )}
          </button>
          <button
            className={`flex items-center justify-between w-full text-center py-4 px-4 bg-white text-black rounded-md ${
              currentSection === 3 ? "font-bold" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentSection(3);
            }}
            disabled={!formData.plotId || !formData.ratePerSqFt}
          >
            <span>Payment Details</span>
            {completedSections.includes(3) && (
              <CircleCheck color="#1f263e" strokeWidth={1.25} />
            )}
          </button>
        </div>
        <div className="w-3/4 p-6 bg-[#303750] text-white shadow-md rounded-md">
          {renderSection()}
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          onClick={() => navigate("/contact-list")} // Navigate to contact list on cancel
          className="bg-white text-black border border-[#303750] hover:bg-gray-100"
        >
          Cancel
        </Button>
        <Button
          type={currentSection < 3 ? "button" : "submit"} // Use "submit" for the last section
          onClick={(e) => {
            if (currentSection < 3) {
              e.preventDefault(); // Prevent default behavior for navigation
              if (isCurrentSectionValid()) {
                setCompletedSections((prev) => [...prev, currentSection]);
                setCurrentSection(currentSection + 1);
              }
            }
          }}
          className="bg-[#1F263E] text-white border border-[#303750] hover:bg-[#2A324D]"
          disabled={!isSectionComplete}
        >
          Save and Next
        </Button>
      </div>
    </form>
  );
}
