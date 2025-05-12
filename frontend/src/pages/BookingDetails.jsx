import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { pdf } from '@react-pdf/renderer';
import { FileText, Download, File, Receipt, CircleUserRound } from "lucide-react";
import BookingDetailsPDF from '@/components/BookingDetailsPDF';
import { apiClient } from "@/lib/utils";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    async function fetchBookingDetails() {
      try {
        setLoading(true);
        const { data } = await apiClient.get(`/bookings/${bookingId}`);
        setBookingDetails(data);
      } catch (error) {
        console.error("Error fetching booking details:", error);
      } finally {
        setLoading(false);
      }
    }

    if (bookingId) {
      fetchBookingDetails();
    } else {
      navigate("/new-booking");
    }
  }, [bookingId, navigate]);

  useEffect(() => {
    if (bookingDetails && !formData) {
      setFormData({
        buyerName: bookingDetails.buyerName,
        address: bookingDetails.address,
        phoneNumber: bookingDetails.phoneNumber,
        gender: bookingDetails.gender,
        email: bookingDetails.email || '',
        dateOfBirth: bookingDetails.dateOfBirth ? new Date(bookingDetails.dateOfBirth).toISOString().split('T')[0] : '',
        paymentType: bookingDetails.paymentType,
        narration: bookingDetails.narration || '',
        totalCost: bookingDetails.totalCost,
        firstPayment: bookingDetails.firstPayment,
        documents: bookingDetails.documents || [],
        uploadingDoc: null,
        plot: bookingDetails.plot || {},
        broker: bookingDetails.broker || {},
        ratePerSqFt: bookingDetails.plot?.ratePerSqFt || bookingDetails.ratePerSqFt || 0,
      });
    }
  }, [bookingDetails]);

  if (loading || !bookingDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1F263E] border-t-transparent"></div>
      </div>
    );
  }

  const handleDownloadDocument = async () => {
    try {
      if (!bookingDetails) {
        toast.error("No booking details available");
        return;
      }

      const pdfData = {
        booking: {
          buyerName: bookingDetails.buyerName,
          phoneNumber: bookingDetails.phoneNumber,
          address: bookingDetails.address,
          gender: bookingDetails.gender,
          email: bookingDetails.email
        },
        plotDetails: {
          plotNumber: bookingDetails.plot?.plotNumber,
          areaSqFt: bookingDetails.plot?.areaSqFt,
          areaSqMt: bookingDetails.plot?.areaSqMt,
          totalCost: bookingDetails.totalCost
        },
        payments: [{
          amount: bookingDetails.firstPayment,
          paymentType: bookingDetails.paymentType,
          narration: bookingDetails.narration
        }],
        broker: bookingDetails.broker
      };

      console.log('PDF Data:', pdfData); // For debugging
      
      const blob = await pdf(<BookingDetailsPDF data={pdfData} />).toBlob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `booking_${bookingDetails.buyerName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("PDF generated successfully");
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleDocumentDownload = async (doc) => {
    try {
      const response = await fetch(doc.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.originalName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Document Download Error:', error);
      toast.error("Failed to download document");
    }
  };

  const handleUpdate = async () => {
    try {
      // Create form data
      const formDataToSend = new FormData();
  
      // Add basic booking data
      const bookingData = {
        buyerName: formData.buyerName,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || undefined,
        paymentType: formData.paymentType,
        narration: formData.narration || "",
        totalCost: Number(formData.totalCost),
        firstPayment: Number(formData.firstPayment),
        email: formData.email || undefined,
        ratePerSqFt: Number(formData.ratePerSqFt)
      };
  
      // Add each booking field to FormData
      Object.entries(bookingData).forEach(([key, value]) => {
        if (value !== undefined) {
          formDataToSend.append(key, value);
        }
      });
  
      // Handle broker data
      if (formData.broker?.name?.trim()) {
        const brokerData = {
          name: formData.broker.name.trim(),
          phoneNumber: formData.broker.phoneNumber || "",
          address: formData.broker.address || "",
          commission: Number(formData.broker.commission) || 0
        };
        formDataToSend.append('brokerData', JSON.stringify(brokerData));
      }
  
      const response = await apiClient.put(`/bookings/${bookingId}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      setBookingDetails(response.data);
      setIsEditing(false);
      toast.success("Booking updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update booking");
    }
  };

  const handleDocumentUpload = async (file, type) => {
    try {
      if (!file) return;
  
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size should be less than 2MB");
        return;
      }
  
      const formData = new FormData();
      formData.append(type, file);
  
      // Add all other booking data for the update
      const bookingData = {
        buyerName: formData.buyerName,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || undefined,
        paymentType: formData.paymentType,
        narration: formData.narration || "",
        totalCost: Number(formData.totalCost),
        firstPayment: Number(formData.firstPayment),
        email: formData.email || undefined,
        ratePerSqFt: Number(formData.ratePerSqFt)
      };
  
      Object.entries(bookingData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value);
        }
      });
  
      // Add broker data if exists
      if (formData.broker?.name) {
        formData.append('brokerData', JSON.stringify(formData.broker));
      }
  
      const response = await apiClient.put(`/bookings/${bookingId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      if (response.data) {
        setBookingDetails(response.data);
        setFormData(prev => ({
          ...prev,
          documents: response.data.documents
        }));
        toast.success(`${type === 'aadharCard' ? 'Aadhar Card' : 'PAN Card'} uploaded successfully`);
      }
    } catch (error) {
      console.error('Document upload error:', error);
      toast.error(`Failed to upload document: ${error.response?.data?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Booking Details</h1>
        <div className="flex gap-4">
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleUpdate} className="bg-[#1F263E] text-white">
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit
              </Button>
              <Button onClick={handleDownloadDocument} className="bg-[#1F263E] text-white">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Replace the display sections with form fields when editing */}
      {isEditing ? (
        <EditForm formData={formData} setFormData={setFormData} handleDocumentUpload={handleDocumentUpload} />
      ) : (
        <>
          <div className="flex items-center justify-center mb-4 gap-2">
            <CircleUserRound size={60} color="#1F263E" />
            <h2 className="text-4xl font-100 text-center text-[#1F263E]">{bookingDetails.buyerName.split(' ')[0] + (bookingDetails.buyerName.split(' ').length > 1 ? ' ' + bookingDetails.buyerName.split(' ').reverse()[0] : '')}</h2>
          </div>
          <div className="flex flex-col gap-6">
            {/* Personal Details Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-[#1F263E]">
                Personal Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-500">Full Name</h3>
                  <p className="text-lg break-words">{bookingDetails.buyerName}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Email</h3>
                  <p className="text-lg break-words">{bookingDetails.email || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Phone Number</h3>
                  <p className="text-lg break-words">{bookingDetails.phoneNumber}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Gender</h3>
                  <p className="text-lg">{bookingDetails.gender}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="font-medium text-gray-500">Address</h3>
                  <p className="text-lg break-words">{bookingDetails.address}</p>
                </div>
              </div>
            </div>

            {/* Plot Details Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-[#1F263E]">
                Plot Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-500">Plot Number</h3>
                  <p className="text-lg">{bookingDetails.plot?.plotNumber}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Area (sq ft)</h3>
                  <p className="text-lg">{bookingDetails.plot?.areaSqFt}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Area (sq mt)</h3>
                  <p className="text-lg">{bookingDetails.plot?.areaSqMt}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Total Cost (Rs.)</h3>
                  <p className="text-lg capitalize">{bookingDetails.totalCost}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Rate per sq ft</h3>
                  <p className="text-lg">₹{bookingDetails.ratePerSqFt}</p>
                </div>
              </div>
            </div>

            {/* Payment Details Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-[#1F263E]">
                Payment Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-500">First Payment</h3>
                  <p className="text-lg">₹{bookingDetails.firstPayment}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Payment Type</h3>
                  <p className="text-lg">{bookingDetails.paymentType}</p>
                </div>
                {bookingDetails.narration && (
                  <div className="col-span-2">
                    <h3 className="font-medium text-gray-500">Narration</h3>
                    <p className="text-lg">{bookingDetails.narration}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Broker Details Section */}
            {bookingDetails.broker && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-[#1F263E]">Broker Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  {bookingDetails.broker.name && (
                    <div>
                      <h3 className="font-medium text-gray-500">Broker Name</h3>
                      <p className="text-lg">{bookingDetails.broker.name}</p>
                    </div>
                  )}
                  {bookingDetails.broker.phoneNumber && (
                    <div>
                      <h3 className="font-medium text-gray-500">Phone Number</h3>
                      <p className="text-lg">{bookingDetails.broker.phoneNumber}</p>
                    </div>
                  )}
                  {bookingDetails.broker.commission > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-500">Commission</h3>
                      <p className="text-lg">{bookingDetails.broker.commission}%</p>
                    </div>
                  )}
                  {bookingDetails.broker.address && (
                    <div>
                      <h3 className="font-medium text-gray-500">Address</h3>
                      <p className="text-lg">{bookingDetails.broker.address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents Section */}
            {bookingDetails.documents?.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-[#1F263E]">Uploaded Documents</h2>
                <div className="grid grid-cols-1 gap-4">
                  {bookingDetails.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-[#1F263E]" />
                        <div>
                          <p className="font-medium capitalize">
                            {doc.type === 'aadharCard' ? 'Aadhar Card' : 'PAN Card'}
                          </p>
                          <p className="text-sm text-gray-500">{doc.originalName}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#1F263E]"
                        onClick={() => handleDocumentDownload(doc)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function EditForm({ formData, setFormData, handleDocumentUpload }) {
  if (!formData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Handle numeric fields
    if (name === "ratePerSqFt" || name === "totalCost" || name === "firstPayment") {
      newValue = Math.ceil(Number(value));
      
      // Update totalCost when ratePerSqFt changes
      if (name === "ratePerSqFt" && formData.plot?.areaSqFt) {
        const newTotalCost = Math.ceil(formData.plot.areaSqFt * Number(value));
        setFormData(prev => ({ ...prev, totalCost: newTotalCost }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-[#1F263E]">Personal Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2">Full Name</Label>
            <Input
              name="buyerName"
              value={formData.buyerName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label className="mb-2">Email</Label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label className="mb-2">Phone Number</Label>
            <Input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label className="mb-2">Date of Birth</Label>
            <Input
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-2">
            <Label className="mb-2">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label className="mb-2">Address</Label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Plot Details section - Moved before Payment Details */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-[#1F263E]">Plot Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2">Plot Number</Label>
            <Input
              name="plotNumber"
              value={formData.plot?.plotNumber || ""}
              readOnly
              disabled
              className="bg-gray-50"
            />
          </div>
          <div>
            <Label className="mb-2">Area (sq ft)</Label>
            <Input
              name="areaSqFt"
              value={formData.plot?.areaSqFt || ""}
              readOnly
              disabled
              className="bg-gray-50"
            />
          </div>
          <div>
            <Label className="mb-2">Rate per sq ft</Label>
            <Input
              name="ratePerSqFt"
              type="number"
              value={formData.ratePerSqFt || ""}
              onChange={handleChange}
              required
              min="1"
              className="bg-white"
            />
          </div>
          <div>
            <Label className="mb-2">Total Cost (Rs.)</Label>
            <Input
              name="totalCost"
              type="number"
              value={formData.totalCost || ""}
              onChange={handleChange}
              required
              min="1"
              className="bg-white"
            />
          </div>
        </div>
      </div>

      {/* Payment Details section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-[#1F263E]">Payment Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2">Payment Type</Label>
            <Select
              value={formData.paymentType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, paymentType: value }))}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2">First Payment (Rs.)</Label>
            <Input
              name="firstPayment"
              type="number"
              value={formData.firstPayment}
              onChange={handleChange}
              required
              min="1"
              max={formData.totalCost}
              className="bg-white"
            />
          </div>
          <div className="col-span-2">
            <Label className="mb-2">Narration</Label>
            <Input
              name="narration"
              value={formData.narration}
              onChange={handleChange}
              placeholder={formData.paymentType !== "Cash" ? "Enter payment details (e.g., Cheque number, Transaction ID)" : "Optional"}
              className="bg-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-[#1F263E]">Broker Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2">Broker Name</Label>
            <Input
              name="brokerName"
              value={formData.broker?.name || ""}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                broker: { ...prev.broker, name: e.target.value }
              }))}
            />
          </div>
          <div>
            <Label className="mb-2">Phone Number</Label>
            <Input
              name="brokerPhone"
              value={formData.broker?.phoneNumber || ""}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                broker: { ...prev.broker, phoneNumber: e.target.value }
              }))}
            />
          </div>
          <div>
            <Label className="mb-2">Address</Label>
            <Input
              name="brokerAddress"
              value={formData.broker?.address || ""}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                broker: { ...prev.broker, address: e.target.value }
              }))}
            />
          </div>
          <div>
            <Label className="mb-2">Commission (%)</Label>
            <Input
              name="brokerCommission"
              type="number"
              value={formData.broker?.commission || ""}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                broker: { ...prev.broker, commission: e.target.value }
              }))}
            />
          </div>
        </div>
      </div>

      {/* Documents section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-[#1F263E]">Documents</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2">Aadhar Card</Label>
            <Input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleDocumentUpload(file, 'aadharCard');
                }
              }}
              className="bg-white"
            />
          </div>
          <div>
            <Label className="mb-2">PAN Card</Label>
            <Input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleDocumentUpload(file, 'panCard');
                }
              }}
              className="bg-white"
            />
          </div>
          {formData.documents?.length > 0 && (
            <div className="col-span-2">
              <h3 className="font-medium mb-2">Uploaded Documents</h3>
              <div className="grid grid-cols-2 gap-4">
                {formData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                    <span className="capitalize">{doc.type}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
