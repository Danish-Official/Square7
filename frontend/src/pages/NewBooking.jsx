import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CircleCheck, Upload, CheckCircle2, X } from "lucide-react";
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
import { useLayout } from "@/context/LayoutContext";

const style = document.createElement('style');
style.textContent = `
  @keyframes scale-check {
    0% { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  .animate-scale-check {
    animation: scale-check 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default function NewBooking() {
  const { selectedLayout } = useLayout();
  const location = useLocation();
  const [formData, setFormData] = useState({
    buyerName: "",
    address: "",
    phoneNumber: "",
    gender: "Male",
    dateOfBirth: "",
    layoutId: selectedLayout || "",
    plotId: "",
    areaSqFt: 0,
    ratePerSqFt: 0,
    paymentType: "Cash",
    brokerName: "",
    brokerPhone: "",
    brokerAddress: "",
    brokerCommission: "",
    firstPayment: 0,
    totalCost: 0,
    bookingDate: new Date().toISOString().split('T')[0],
    narration: "",
    documents: [],
    email: "",  // Add email field
    uploadingDoc: null,  // Add this line
  });
  const [plots, setPlots] = useState(null);
  const [availablePlots, setAvailablePlots] = useState([]);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [currentSection, setCurrentSection] = useState(1);
  const [isSectionComplete, setIsSectionComplete] = useState(false);
  const [completedSections, setCompletedSections] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

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
    if (selectedLayout) {
      setFormData((prev) => ({
        ...prev,
        layoutId: selectedLayout,
      }));
    }
  }, [selectedLayout]);

  useEffect(() => {
    // Update plots when layout changes
    if (formData.layoutId) {
      const fetchAvailablePlots = async () => {
        try {
          const response = await apiClient.get(
            `/plots/available-plots/${formData.layoutId}`
          );
          setAvailablePlots(response.data);
        } catch (error) {
          console.error("Failed to fetch plots:", error);
          setAvailablePlots([]);
        }
      };
      fetchAvailablePlots();
    } else {
      setAvailablePlots([]);
    }
  }, [formData.layoutId]);

  useEffect(() => {
    Object.values(errors).some((error) => error !== "");
  }, [errors, formData]);

  useEffect(() => {
    let complete = true;
    if (currentSection === 1) {
      complete = formData.buyerName &&
        formData.phoneNumber &&
        formData.address &&        // Add address check
        formData.bookingDate;      // Add booking date check
    } else if (currentSection === 2) {
      complete = formData.plotId &&
        formData.ratePerSqFt > 0;  // Ensure rate is greater than 0
    } else if (currentSection === 3) {
      complete = formData.firstPayment > 0 &&
        formData.paymentType &&     // Add payment type check
        (formData.paymentType !== "Cash" ? formData.narration : true); // Narration required for non-cash payments
    }
    setIsSectionComplete(complete);
  }, [currentSection, formData]);

  useEffect(() => {
    // Auto-select plot if coming from plot layout
    if (location.state?.selectedPlotId && availablePlots.length > 0) {
      const selectedPlot = availablePlots.find(
        (plot) => plot._id === location.state.selectedPlotId
      );
      if (selectedPlot) {
        handlePlotChange(selectedPlot._id);
      }
    }
  }, [location.state, availablePlots]);

  const validateField = (name, value) => {
    let error = "";
    if (name === "buyerName") {
      if (!value) {
        error = "Name is required.";
      } else if (!/^[A-Za-z\s]+$/.test(value)) {
        error = "Name should contain only alphabets and spaces.";
      }
    } else if (name === "phoneNumber") {
      if (!value) {
        error = "Phone number is required.";
      } else if (!/^\d{10}$/.test(value)) {
        error = "Phone number should be exactly 10 digits.";
      }
    } else if (name === "email") {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = "Invalid email format.";
      }
    } else if (name === "address") {
      if (!value.trim()) {
        error = "Address is required.";
      }
    } else if (name === "firstPayment") {
      if (!value) {
        error = "First payment is required.";
      } else if (value <= 0 || value > formData.totalCost) {
        error = "First payment should be greater than 0 and less than or equal to the total cost.";
      }
    } else if (name === "dateOfBirth") {
      if (value) { // Optional field
        const dob = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 18) {
          error = "Buyer must be at least 18 years old.";
        }
      }
    } else if (name === "narration") {
      if (formData.paymentType !== "Cash" && !value.trim()) {
        error = "Narration is required for non-cash payments.";
      }
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === ""; // Return true if valid
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let roundedValue = value;

    // Round up numeric fields
    if (name === "ratePerSqFt" || name === "firstPayment") {
      roundedValue = Math.ceil(Number(value));
    }

    setFormData((prev) => ({ ...prev, [name]: roundedValue }));
    validateField(name, roundedValue);

    if (name === "ratePerSqFt") {
      setFormData((prev) => ({
        ...prev,
        totalCost: Math.ceil(prev.areaSqFt * roundedValue),
      }));
    }
  };

  const handlePlotChange = (value) => {
    const selectedPlot = availablePlots.find((plot) => plot._id === value);
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

    // Validate all required fields before submission
    const requiredFields = {
      buyerName: 'Buyer Name',
      phoneNumber: 'Phone Number',
      address: 'Address',
      plotId: 'Plot',
      paymentType: 'Payment Type',
      firstPayment: 'First Payment',
      totalCost: 'Total Cost',
      bookingDate: 'Booking Date'
    };

    const errors = {};
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field]) {
        errors[field] = `${label} is required`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Add basic booking data
      const bookingData = {
        buyerName: formData.buyerName,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined,
        plot: formData.plotId,
        paymentType: formData.paymentType,
        narration: formData.narration || "",
        totalCost: Number(formData.totalCost),
        firstPayment: Number(formData.firstPayment),
        bookingDate: new Date(formData.bookingDate).toISOString(),
        email: formData.email || undefined
      };

      // Append each booking field to FormData
      Object.entries(bookingData).forEach(([key, value]) => {
        if (value !== undefined) {
          formDataToSend.append(key, value);
        }
      });

      // Handle broker data
      if (formData.brokerName?.trim()) {
        const brokerData = {
          name: formData.brokerName.trim(),
          phoneNumber: formData.brokerPhone || "",
          address: formData.brokerAddress || "",
          commission: Number(formData.brokerCommission) || 0
        };
        formDataToSend.append('brokerData', JSON.stringify(brokerData));
      }

      // Handle documents
      const aadharDoc = formData.documents.find(doc => doc.type === 'aadharCard');
      if (aadharDoc) {
        formDataToSend.append('aadharCard', aadharDoc.file);
      }

      const panDoc = formData.documents.find(doc => doc.type === 'panCard');
      if (panDoc) {
        formDataToSend.append('panCard', panDoc.file);
      }

      // Log the data being sent
      console.log('Sending booking data:', Object.fromEntries(formDataToSend));

      const bookingResponse = await apiClient.post("/bookings", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!bookingResponse.data?._id) {
        throw new Error('Invalid booking response');
      }

      // Create invoice after successful booking
      await apiClient.post("/invoices", {
        booking: bookingResponse.data._id,
        payments: [{
          amount: Number(formData.firstPayment),
          paymentDate: new Date(formData.bookingDate).toISOString(),
          paymentType: formData.paymentType,
          narration: formData.narration || ""
        }]
      });

      toast.success("Booking created successfully!");
      navigate(`/buyer/${bookingResponse.data._id}`, { replace: true });

    } catch (error) {
      console.error('Error details:', error);
      toast.error(error.response?.data?.message || "Failed to create booking");
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
      case 4: // Add this case
        return true; // Documents are optional
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
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="buyerName" className="mb-2 block">Full Name</Label>
                <Input
                  id="buyerName"
                  name="buyerName"
                  value={formData.buyerName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="bg-white text-black"
                />
                {errors.buyerName && (
                  <p className="text-red-500 text-sm">{errors.buyerName}</p>
                )}
              </div>
              <div className="col-span-2">
                <Label htmlFor="address" className="mb-2 block">Address</Label>
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

              <div>
                <Label htmlFor="bookingDate" className="mb-2 block">Booking Date</Label>
                <Input
                  id="bookingDate"
                  name="bookingDate"
                  type="date"
                  value={formData.bookingDate}
                  onChange={handleChange}
                  required
                  className="bg-white text-black"
                />
              </div>

              <div>
                <Label htmlFor="email" className="mb-2 block">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="bg-white text-black"
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="mb-2 block">Phone Number</Label>
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

              <div>
                <Label htmlFor="dateOfBirth" className="mb-2 block">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="bg-white text-black"
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>
                )}
              </div>


              <div className="col-span-2">
                <Label htmlFor="gender" className="mb-2 block">Gender</Label>
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
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3>Plot Details</h3>
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="layoutId" className="mb-2 block">Layout</Label>
                <Input
                  id="layoutId"
                  value={selectedLayout === "layout1" ? "KRISHNAM NAGAR 1" : "KRISHNAM NAGAR 2"}
                  readOnly
                  placeholder="Layout"
                  className="bg-white text-black w-full"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="plotId" className="mb-2 block">Plot</Label>
                <Select
                  onValueChange={handlePlotChange}
                  value={formData.plotId}
                  required
                >
                  <SelectTrigger className="bg-white text-black w-full">
                    <SelectValue placeholder="Select Plot" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(availablePlots) &&
                      availablePlots.map((plot) => (
                        <SelectItem key={plot._id} value={plot._id}>
                          Plot {plot.plotNumber}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="areaSqMt" className="mb-2 block">Area (sq mt)</Label>
                <Input
                  id="areaSqMt"
                  value={
                    formData.areaSqFt
                      ? (formData.areaSqFt / 10.764).toFixed(2)
                      : ""
                  }
                  readOnly
                  placeholder="Area (sq mt)"
                  className="bg-white text-black"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="areaSqFt" className="mb-2 block">Area (sq ft)</Label>
                <Input
                  id="areaSqFt"
                  value={formData.areaSqFt || ""}
                  readOnly
                  placeholder="Area (sq ft)"
                  className="bg-white text-black"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="ratePerSqFt" className="mb-2 block">Rate per sq ft</Label>
                <Input
                  id="ratePerSqFt"
                  name="ratePerSqFt"
                  type="number"
                  value={formData.ratePerSqFt || ""}
                  onChange={handleChange}
                  placeholder="Rate per sq ft"
                  required
                  className="bg-white text-black"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="totalCost" className="mb-2 block">Total Cost</Label>
                <Input
                  id="totalCost"
                  value={formData.totalCost || ""}
                  readOnly
                  placeholder="Total Cost"
                  className="bg-white text-black"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3>Payment Details</h3>
            <div className="space-y-2">
              <Label htmlFor="paymentType" className="mb-2 block">Payment Type</Label>
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, paymentType: value }))
                }
                value={formData.paymentType}
                required
              >
                <SelectTrigger className="w-full bg-white text-black">
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
              <Label htmlFor="narration" className="mb-2 block">Remarks</Label>
              <Input
                id="narration"
                name="narration"
                value={formData.narration}
                onChange={handleChange}
                placeholder="Enter payment details (e.g., Cheque number, Transaction ID)"
                className="bg-white text-black"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstPayment" className="mb-2 block">First Payment</Label>
              <Input
                id="firstPayment"
                name="firstPayment"
                type="number"
                value={formData.firstPayment || ""}
                onChange={handleChange}
                placeholder="First Payment"
                required
                className="bg-white text-black"
              />
              {errors.firstPayment && (
                <p className="text-red-500 text-sm">{errors.firstPayment}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="brokerName" className="mb-2 block">Reference</Label>
              <Input
                id="brokerName"
                name="brokerName"
                value={formData.brokerName}
                onChange={handleChange}
                placeholder="Enter reference"
                className="bg-white text-black"
              />
              {/* {errors.brokerName && (
                <p className="text-red-500 text-sm">{errors.brokerName}</p>
              )} */}
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="brokerPhone" className="mb-2 block">Broker Phone (Optional)</Label>
              <Input
                id="brokerPhone"
                name="brokerPhone"
                value={formData.brokerPhone}
                onChange={handleChange}
                placeholder="Enter broker phone number"
                className="bg-white text-black"
              />
              {errors.brokerPhone && (
                <p className="text-red-500 text-sm">{errors.brokerPhone}</p>
              )}
            </div> */}
          </div>
        );
      case 4:
        return (
          <div className="space-y-8">
            <h3 className="text-xl font-semibold mb-6">Upload Documents</h3>

            {/* Aadhar Card Upload */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aadharCard" className="text-lg mb-2 block">Aadhar Card</Label>
                <div className="flex items-center justify-center w-full">
                  <label className={`relative flex flex-col items-center justify-center w-100 h-72 border-2 border-gray-300 border-dashed rounded-xl ${!formData.documents.find(doc => doc.type === 'aadharCard') ? 'cursor-pointer hover:bg-white/10' : 'cursor-default pointer-events-none'
                    } bg-white/5 backdrop-blur-sm transition-all duration-300`}>
                    {isUploading && formData.uploadingDoc === 'aadharCard' ? (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                        <p className="mt-4 text-lg font-medium text-white/80">Uploading...</p>
                      </div>
                    ) : formData.documents.find(doc => doc.type === 'aadharCard') ? (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <CheckCircle2 className="w-16 h-16 mb-4 text-green-400 animate-scale-check" />
                        <p className="mb-2 text-lg font-medium text-white/80">
                          {formData.documents.find(doc => doc.type === 'aadharCard').file.name}
                        </p>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFormData(prev => ({
                              ...prev,
                              documents: prev.documents.filter(doc => doc.type !== 'aadharCard')
                            }));
                          }}
                          className="mt-4 flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors duration-200 hover:bg-red-500/10 rounded-md pointer-events-auto"
                        >
                          <X className="w-4 h-4" />
                          <span>Remove file</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-16 h-16 mb-4 text-white/60" />
                        <p className="mb-2 text-lg font-medium text-white/80">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-sm text-white/60">PDF, PNG, JPG or JPEG (MAX. 2MB)</p>
                      </div>
                    )}
                    <input
                      id="aadharCard"
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            toast.error("File size should be less than 2MB");
                            return;
                          }
                          setIsUploading(true);
                          setFormData(prev => ({ ...prev, uploadingDoc: 'aadharCard' }));
                          try {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            setFormData(prev => ({
                              ...prev,
                              documents: [...prev.documents.filter(doc => doc.type !== 'aadharCard'), { type: 'aadharCard', file }]
                            }));
                          } catch (error) {
                            toast.error("Failed to upload file");
                          } finally {
                            setIsUploading(false);
                            setFormData(prev => ({ ...prev, uploadingDoc: null }));
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* PAN Card Upload */}
              <div className="space-y-2">
                <Label htmlFor="panCard" className="text-lg mb-2 block">PAN Card</Label>
                <div className="flex items-center justify-center w-full">
                  <label className={`relative flex flex-col items-center justify-center w-100 h-72 border-2 border-gray-300 border-dashed rounded-xl ${!formData.documents.find(doc => doc.type === 'panCard') ? 'cursor-pointer hover:bg-white/10' : 'cursor-default pointer-events-none'
                    } bg-white/5 backdrop-blur-sm transition-all duration-300`}>
                    {isUploading && formData.uploadingDoc === 'panCard' ? (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                        <p className="mt-4 text-lg font-medium text-white/80">Uploading...</p>
                      </div>
                    ) : formData.documents.find(doc => doc.type === 'panCard') ? (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <CheckCircle2 className="w-16 h-16 mb-4 text-green-400 animate-scale-check" />
                        <p className="mb-2 text-lg font-medium text-white/80">
                          {formData.documents.find(doc => doc.type === 'panCard').file.name}
                        </p>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFormData(prev => ({
                              ...prev,
                              documents: prev.documents.filter(doc => doc.type !== 'panCard')
                            }));
                          }}
                          className="mt-4 flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors duration-200 hover:bg-red-500/10 rounded-md pointer-events-auto"
                        >
                          <X className="w-4 h-4" />
                          <span>Remove file</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-16 h-16 mb-4 text-white/60" />
                        <p className="mb-2 text-lg font-medium text-white/80">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-sm text-white/60">PDF, PNG, JPG or JPEG (MAX. 2MB)</p>
                      </div>
                    )}
                    <input
                      id="panCard"
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            toast.error("File size should be less than 2MB");
                            return;
                          }
                          setIsUploading(true);
                          setFormData(prev => ({ ...prev, uploadingDoc: 'panCard' }));
                          try {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            setFormData(prev => ({
                              ...prev,
                              documents: [...prev.documents.filter(doc => doc.type !== 'panCard'), { type: 'panCard', file }]
                            }));
                          } catch (error) {
                            toast.error("Failed to upload file");
                          } finally {
                            setIsUploading(false);
                            setFormData(prev => ({ ...prev, uploadingDoc: null }));
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-semibold">New Booking</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="flex space-x-4">
          <div className="w-1/4 p-4 border-r bg-[#303750] text-white shadow-md rounded-md flex flex-col gap-y-8">
            <h3 className="text-lg font-bold text-center">Quick Navigation</h3>
            <button
              className={`flex items-center justify-between w-full text-center py-4 px-4 bg-white text-black rounded-md ${currentSection === 1 ? "font-bold" : ""
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
              className={`flex items-center justify-between w-full text-center py-4 px-4 bg-white text-black rounded-md ${currentSection === 2 ? "font-bold" : ""
                }`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentSection(2);
              }}
              disabled={!formData.buyerName || !formData.phoneNumber || !formData.address} // Remove dateOfBirth check
            >
              <span>Plot Details</span>
              {completedSections.includes(2) && (
                <CircleCheck color="#1f263e" strokeWidth={1.25} />
              )}
            </button>

            <button
              className={`flex items-center justify-between w-full text-center py-4 px-4 bg-white text-black rounded-md ${currentSection === 3 ? "font-bold" : ""
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

            <button
              className={`flex items-center justify-between w-full text-center py-4 px-4 bg-white text-black rounded-md ${currentSection === 4 ? "font-bold" : ""
                }`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentSection(4);
              }}
              disabled={!formData.firstPayment}
            >
              <span>Upload Documents</span>
              {completedSections.includes(4) && (
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
            onClick={() => navigate("/contact-list")}
            className="bg-white text-black border border-[#303750] hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            type={currentSection < 4 ? "button" : "submit"}
            onClick={(e) => {
              if (currentSection < 4) {
                e.preventDefault();
                if (isCurrentSectionValid()) {
                  setCompletedSections((prev) => [...prev, currentSection]);
                  setCurrentSection(currentSection + 1);
                }
              }
            }}
            className="bg-[#1F263E] text-white border border-[#303750] hover:bg-[#2A324D]"
            disabled={!isSectionComplete || Object.keys(errors).some(key => errors[key])}
          >
            Save and Next
          </Button>
        </div>
      </form>
    </div>
  );
}
