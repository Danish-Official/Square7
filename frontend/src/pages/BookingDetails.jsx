import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Download, Receipt, CircleUserRound, X, Edit2, Trash2, Send } from "lucide-react";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PaymentsTable from "@/components/PaymentsTable";
import PaymentModal from "@/components/PaymentModal";
import BrokerEditModal from "@/components/BrokerEditModal";
import { useAuth } from "@/context/AuthContext";
import { useLayout } from "@/context/LayoutContext";
import { generatePaymentReceiptPDF, generateStatementPDF } from "@/utils/pdfUtils";

export default function BookingDetails() {
  const { auth } = useAuth();
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { selectedLayout } = useLayout();
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [broker, setBroker] = useState(null);
  const [editingBroker, setEditingBroker] = useState(null); // Add this
  const [editedBrokerData, setEditedBrokerData] = useState({}); // Add this
  const [subsequentPayment, setSubsequentPayment] = useState(null);
  const [editingPaymentIndex, setEditingPaymentIndex] = useState(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [isUploading, setIsUploading] = useState(false); // New state for upload status
  const [tempDocuments, setTempDocuments] = useState([]); // Add this state if not already present
  const [hasValidationErrors, setHasValidationErrors] = useState(false); // Add new state for tracking validation

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [bookingRes, invoiceRes, brokerRes] = await Promise.all([
          apiClient.get(`/bookings/${bookingId}`),
          apiClient.get(`/invoices/booking/${bookingId}`),
          apiClient.get(`/brokers/booking/${bookingId}`)
        ]);
        setBookingDetails(bookingRes.data);
        setInvoice(invoiceRes.data);
        setBroker(brokerRes.data)
      } catch (error) {
        console.error("Error fetching details:", error);
        toast.error("Failed to fetch details");
      } finally {
        setLoading(false);
      }
    }

    if (bookingId) {
      fetchData();
    } else {
      navigate("/new-booking");
    }
  }, [bookingId, navigate]);

  const calculateBrokerFinancials = (broker, totalCost) => {
    if (!broker || !totalCost) return null;

    const commission = broker.commission || 0;
    const tdsPercentage = broker.tdsPercentage || 5;
    const amount = (totalCost * commission) / 100;
    const tdsAmount = (amount * tdsPercentage) / 100;
    const netAmount = amount - tdsAmount;

    return {
      amount: Math.round(amount),
      tdsAmount: Math.round(tdsAmount),
      netAmount: Math.round(netAmount),
      commission,
      tdsPercentage
    };
  };

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
    // Validate all fields before updating
    if (hasValidationErrors) {
      toast.error("Please fix all errors before saving");
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

      // Handle deleted documents
      tempDocuments.forEach(doc => {
        if (doc.isDeleted) {
          formDataToSend.append(`delete_${doc.type}`, 'true');
        } else if (doc.file) {
          formDataToSend.append(doc.type, doc.file);
        }
      });

      const response = await apiClient.put(`/bookings/${bookingId}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update state with the response data
      setBookingDetails(response.data);
      setFormData(prev => ({
        ...prev,
        documents: response.data.documents
      }));
      setIsEditing(false);

      // Cleanup temporary documents
      tempDocuments.forEach(doc => {
        if (doc.previewUrl) {
          URL.revokeObjectURL(doc.previewUrl);
        }
      });
      setTempDocuments([]);

      toast.success("Booking updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update booking");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    // Reset form data to original booking details
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

    // Clear temp documents
    tempDocuments.forEach(doc => {
      if (doc.previewUrl) {
        URL.revokeObjectURL(doc.previewUrl);
      }
    });
    setTempDocuments([]);

    // Reset validation state
    setHasValidationErrors(false);

    setIsEditing(false);
  };

  const handleAddOrEditPayment = async (paymentData) => {
    try {
      if (editingPaymentIndex !== null) {
        // Editing an existing payment
        const updatedPayments = [...invoice.payments];
        updatedPayments[editingPaymentIndex] = paymentData;

        const response = await apiClient.post(
          `/invoices/${invoice._id}/add-payment`,
          { ...paymentData, paymentIndex: editingPaymentIndex }
        );

        setInvoice(response.data);
        toast.success("Payment updated successfully");
      } else {
        // Adding a new payment
        const response = await apiClient.post(
          `/invoices/${invoice._id}/add-payment`,
          paymentData
        );
        setInvoice(response.data);
        toast.success("Payment added successfully");
      }
    } catch (error) {
      toast.error("Failed to save payment");
    } finally {
      setIsPaymentDialogOpen(false);
      setEditingPaymentIndex(null);
      setSubsequentPayment(null);
    }
  };

  const handleEditPayment = (index) => {
    const payment = invoice?.payments?.[index];
    if (payment) {
      const formattedDate = new Date(payment.paymentDate).toISOString().split('T')[0];
      setSubsequentPayment({
        amount: payment.amount,
        paymentDate: formattedDate,
        paymentType: payment.paymentType,
        narration: payment.narration || ""
      });
      setEditingPaymentIndex(index);
      setIsPaymentDialogOpen(true);
    }
  };

  const handleDeletePayment = async (index) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    try {
      const response = await apiClient.delete(`/invoices/${invoice._id}/payments/${index}`);
      setInvoice(response.data);
      toast.success("Payment deleted successfully");
    } catch (error) {
      toast.error("Failed to delete payment");
    }
  };

  const handleDownloadPaymentReceipt = async (payment) => {
    try {
      await generatePaymentReceiptPDF(
        payment,
        invoice,
        selectedLayout
      );
    } catch (error) {
      toast.error("Failed to download payment receipt");
    }
  };

  // Add this helper function
  const isAdmin = auth.user?.role === "superadmin";

  const handleEdit = (broker) => {
    setEditingBroker(broker._id);
    setEditedBrokerData({
      name: broker.name,
      phoneNumber: broker.phoneNumber,
      commission: broker.commission,
      tdsPercentage: broker.tdsPercentage,
      date: broker.date
    });
  };

  const handleBrokerEditCancel = () => {
    setEditingBroker(null);
    setEditedBrokerData({});
  };

  const handleBrokerEditChange = (field, value) => {
    setEditedBrokerData(prev => ({ ...prev, [field]: value }));
  };

  const handleBrokerSave = async () => {
    try {
      const response = await apiClient.put(`/bookings/${bookingId}/broker`, editedBrokerData);
      setBroker(response.data);
      setEditingBroker(null);
      setEditedBrokerData({});
      toast.success("Broker updated successfully");
    } catch (error) {
      console.error('Error updating broker:', error);
      toast.error(error.response?.data?.message || "Failed to update broker");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {bookingDetails && (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold">Buyer Details</h1>
            <div className="flex gap-4">
              {isEditing ? (
                <>
                  <Button onClick={resetForm} variant="outline">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    className="bg-[#1F263E] text-white"
                    disabled={hasValidationErrors}
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    Edit
                  </Button>
                  {invoice && (
                    <Button
                      onClick={() => generateStatementPDF(invoice, selectedLayout)}
                      variant="outline"
                      className="bg-white hover:bg-[#f7f7f7]"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Statement
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Replace the display sections with form fields when editing */}
          {isEditing ? (
            <EditForm
              formData={formData}
              setFormData={setFormData}
              tempDocuments={tempDocuments}
              setTempDocuments={setTempDocuments}
              setHasValidationErrors={setHasValidationErrors}
            />
          ) : (
            <>
              <div className="flex items-center justify-center mb-4 gap-2">
                <CircleUserRound size={60} color="#1F263E" />
                <h2 className="text-4xl font-100 text-center text-[#1F263E]">
                  {bookingDetails.buyerName.split(' ')[0] + (bookingDetails.buyerName.split(' ').length > 1 ? ' ' + bookingDetails.buyerName.split(' ').reverse()[0] : '')}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-0.5">
                {/* Personal Details Section */}
                <div className="bg-white rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4 text-center bg-[#1F263E] text-white py-2 rounded-t-md">
                    Personal Details
                  </h2>
                  <div className="space-y-4 w-[70%] mx-auto p-2">
                    <div className="flex items-center">
                      <span className="min-w-[120px] font-medium text-gray-500 text-sm">Full Name</span>
                      <p className="break-words flex-1 text-sm">{bookingDetails.buyerName}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="min-w-[120px] font-medium text-gray-500 text-sm">Email</span>
                      <p className="break-words flex-1 text-sm">{bookingDetails.email || 'Not provided'}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="min-w-[120px] font-medium text-gray-500 text-sm">Phone Number</span>
                      <p className="break-words flex-1 text-sm">{bookingDetails.phoneNumber}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="min-w-[120px] font-medium text-gray-500 text-sm">Gender</span>
                      <p className="flex-1 text-sm">{bookingDetails.gender}</p>
                    </div>
                    <div className="flex items-start">
                      <span className="min-w-[120px] font-medium text-gray-500 text-sm">Address</span>
                      <p className="break-words flex-1 text-sm">{bookingDetails.address}</p>
                    </div>
                  </div>
                </div>

                {/* Plot Details Section */}
                <div className="bg-white rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4 text-center bg-[#1F263E] text-white py-2 rounded-t-md">
                    Plot Details
                  </h2>
                  <div className="space-y-4 w-[40%] mx-auto p-2">
                    <div className="flex items-center">
                      <span className="min-w-[120px] font-medium text-gray-500 text-sm">Plot Number</span>
                      <p className="flex-1 text-sm">{bookingDetails.plot?.plotNumber}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="min-w-[120px] font-medium text-gray-500 text-sm">Area (sq ft)</span>
                      <p className="flex-1 text-sm">{bookingDetails.plot?.areaSqFt}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="min-w-[120px] font-medium text-gray-500 text-sm">Area (sq mt)</span>
                      <p className="flex-1 text-sm">{bookingDetails.plot?.areaSqMt}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="min-w-[120px] font-medium text-gray-500 text-sm">Total Cost</span>
                      <p className="capitalize flex-1 text-sm">Rs. {bookingDetails.totalCost}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="min-w-[120px] font-medium text-gray-500 text-sm">Rate per sq ft</span>
                      <p className="flex-1 text-sm">Rs. {bookingDetails.ratePerSqFt}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Details Section */}
                <div className="bg-white rounded-lg shadow-md col-span-2 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-[#1F263E]">Payment History</h3>
                    <Button
                      onClick={() => setIsPaymentDialogOpen(true)}
                      className="bg-[#1F263E] text-white"
                    >
                      Add Payment
                    </Button>
                  </div>

                  <PaymentsTable
                    payments={invoice?.payments || []}
                    onEditPayment={handleEditPayment}
                    onDeletePayment={handleDeletePayment}
                    onDownloadReceipt={handleDownloadPaymentReceipt}
                  />
                </div>

                {broker && (
                  <div className="bg-white rounded-lg shadow-md col-span-2 p-4">
                    <h2 className="font-semibold text-[#1F263E] mb-4">Advisor Details</h2>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone Number</TableHead>
                          <TableHead>Commission (%)</TableHead>
                          <TableHead>Amount (Rs. )</TableHead>
                          <TableHead>TDS (%)</TableHead>
                          <TableHead>TDS Amount (Rs. )</TableHead>
                          <TableHead>Net Amount (Rs. )</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const financials = calculateBrokerFinancials(broker, bookingDetails.totalCost);
                          return (
                            <TableRow>
                              <TableCell>{broker.name}</TableCell>
                              <TableCell>{broker.phoneNumber}</TableCell>
                              <TableCell>{broker.commission}%</TableCell>
                              <TableCell>Rs. {financials?.amount || 0}</TableCell>
                              <TableCell>{financials?.tdsPercentage}%</TableCell>
                              <TableCell>Rs. {financials?.tdsAmount || 0}</TableCell>
                              <TableCell>Rs. {financials?.netAmount || 0}</TableCell>
                              <TableCell>
                                {broker.date ? new Date(broker.date).toLocaleDateString() : "-"}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleEdit(broker)} className="h-8 px-2 lg:px-3"><Edit2 size={16} color="#000" /></Button>
                                  <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-3" onClick={async () => {
                                    // Generate PDF for advisor (broker) details
                                    try {
                                      // You should have a BrokerPDF component or similar, or use a utility to generate PDF
                                      // For now, just a dummy toast
                                      toast.info('Download advisor PDF feature coming soon!');
                                    } catch (error) {
                                      toast.error('Failed to download advisor PDF');
                                    }
                                  }}><Download size={16} color="#000" /></Button>
                                  <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-3"><Send size={16} color="#000" /></Button>
                                  {isAdmin && (
                                    <Button variant="ghost" size="sm" onClick={() => handleBrokerDelete(broker)} className="h-8 px-2 lg:px-3 text-red-500 hover:text-red-700"><Trash2 size={16} color="#f00505" /></Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })()}
                      </TableBody>
                    </Table>

                    <BrokerEditModal
                      isOpen={editingBroker !== null}
                      onClose={handleBrokerEditCancel}
                      editedData={editedBrokerData}
                      handleEditChange={handleBrokerEditChange}
                      handleSave={handleBrokerSave}
                      errors={{}}
                      isAdmin={isAdmin}
                    />
                  </div>
                )}

                {/* Documents Section */}
                {bookingDetails.documents?.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md col-span-2">
                    <h2 className="text-xl font-semibold mb-4 text-center bg-[#1F263E] text-white py-2 rounded-t-md">
                      Uploaded Documents
                    </h2>
                    <div className="space-y-4 p-4">
                      {bookingDetails.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-[#f7f7f7]">
                          <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-[#1F263E]" />
                            <div>
                              <p className="font-medium capitalize text-sm">
                                {doc.type === 'aadharCardFront' ? 'Aadhar Card Front Side' :
                                  doc.type === 'aadharCardBack' ? 'Aadhar Card Back Side' : 'PAN Card'}
                              </p>
                              <p className="text-xs text-gray-500">{doc.originalName}</p>
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

              <PaymentModal
                isOpen={isPaymentDialogOpen}
                onClose={() => {
                  setIsPaymentDialogOpen(false);
                  resetForm();
                }}
                payment={subsequentPayment}
                onSave={handleAddOrEditPayment}
                isEditing={editingPaymentIndex !== null}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

function EditForm({ formData, setFormData, tempDocuments, setTempDocuments, setHasValidationErrors }) {
  const fileInputRefs = {
    aadharCardFront: useRef(null),
    aadharCardBack: useRef(null),
    panCard: useRef(null)
  };

  const [errors, setErrors] = useState({});

  // Add validation check effect
  useEffect(() => {
    const requiredFields = ['buyerName', 'phoneNumber', 'address', 'ratePerSqFt', 'totalCost', 'firstPayment'];
    const hasErrors = Object.keys(errors).some(key => errors[key]) ||
      requiredFields.some(field => !formData[field]);

    setHasValidationErrors(hasErrors);
  }, [errors, formData, setHasValidationErrors]);

  const validateInput = (name, value) => {
    switch (name) {
      case 'buyerName':
        if (!value.trim()) return 'Name is required';
        if (value.length < 3) return 'Name must be at least 3 characters';
        if (!/^[a-zA-Z\s]*$/.test(value)) return 'Name should only contain letters';
        return '';

      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return 'Invalid email format';
        return '';

      case 'phoneNumber':
        if (!value) return 'Phone number is required';
        if (!/^[0-9]{10}$/.test(value))
          return 'Phone number must be 10 digits';
        return '';

      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.length < 10) return 'Address is too short';
        return '';

      case 'totalCost':
        if (!value) return 'Total cost is required';
        if (value <= 0) return 'Total cost must be greater than 0';
        return '';

      case 'firstPayment':
        if (!value) return 'Booking payment is required';
        if (value <= 0) return 'Booking payment must be greater than 0';
        if (value > formData.totalCost)
          return 'Booking payment cannot exceed total cost';
        return '';

      case 'ratePerSqFt':
        if (!value) return 'Rate per sq ft is required';
        if (value <= 0) return 'Rate must be greater than 0';
        return '';

      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Handle numeric fields
    if (name === "ratePerSqFt" || name === "totalCost" || name === "firstPayment") {
      newValue = Math.ceil(Number(value));

      if (name === "ratePerSqFt" && formData.plot?.areaSqFt) {
        const newTotalCost = Math.ceil(formData.plot.areaSqFt * Number(value));
        setFormData(prev => ({ ...prev, totalCost: newTotalCost }));

        // Validate totalCost
        const totalCostError = validateInput('totalCost', newTotalCost);
        setErrors(prev => ({ ...prev, totalCost: totalCostError }));
        return;
      }
    }

    // Validate the input
    const error = validateInput(name, newValue);
    setErrors(prev => ({ ...prev, [name]: error }));

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const clearFileInput = (type) => {
    if (fileInputRefs[type]?.current) {
      fileInputRefs[type].current.value = '';
    }
  };

  const handleTempDocumentUpload = (file, type) => {
    // Remove any existing temp document of the same type
    setTempDocuments(prev => prev.filter(doc => doc.type !== type));

    // Create preview URL for the new file
    const previewUrl = URL.createObjectURL(file);

    // Add the new document
    setTempDocuments(prev => [
      ...prev,
      {
        type,
        file,
        previewUrl,
        originalName: file.name
      }
    ]);

    // Remove the document from formData if it exists
    setFormData(prev => ({
      ...prev,
      documents: prev.documents?.filter(doc => doc.type !== type) || []
    }));
  };

  // Modify input fields to show validation errors
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center bg-[#1F263E] text-white py-2 rounded-md">Personal Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Label className="min-w-[120px] text-sm">Full Name *</Label>
            <div className="flex-1">
              <Input
                name="buyerName"
                value={formData.buyerName}
                onChange={handleChange}
                className={`text-sm ${errors.buyerName ? "border-red-500" : ""}`}
              />
              {errors.buyerName && <p className="text-red-500 text-xs mt-1">{errors.buyerName}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="min-w-[120px] text-sm">Email</Label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="min-w-[120px] text-sm">Phone Number *</Label>
            <div className="flex-1">
              <Input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={errors['phoneNumber'] ? "border-red-500" : ""}
              />
              {errors['phoneNumber'] && <p className="text-red-500 text-xs mt-1">{errors['phoneNumber']}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="min-w-[120px] text-sm">Date of Birth</Label>
            <Input
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="min-w-[120px] text-sm">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
              className="flex-1 text-sm"
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male" className="text-sm">Male</SelectItem>
                <SelectItem value="Female" className="text-sm">Female</SelectItem>
                <SelectItem value="Other" className="text-sm">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Label className="min-w-[120px] text-sm">Address *</Label>
            <div className="flex-1">
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full p-2 border rounded text-sm ${errors.address ? "border-red-500" : ""}`}
                rows={3}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center bg-[#1F263E] text-white py-2 rounded-md">Plot Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Label className="min-w-[120px] text-sm">Plot Number</Label>
            <Input
              name="plotNumber"
              value={formData.plot?.plotNumber || ""}
              readOnly
              disabled
              className="flex-1 bg-[#f7f7f7] text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="min-w-[120px] text-sm">Area (sq ft)</Label>
            <Input
              name="areaSqFt"
              value={formData.plot?.areaSqFt || ""}
              readOnly
              disabled
              className="flex-1 bg-[#f7f7f7] text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="min-w-[120px] text-sm">Rate per sq ft *</Label>
            <div className="flex-1">
              <Input
                name="ratePerSqFt"
                type="number"
                value={formData.ratePerSqFt || ""}
                onChange={handleChange}
                className={errors.ratePerSqFt ? "border-red-500" : ""}
              />
              {errors.ratePerSqFt && <p className="text-red-500 text-sm mt-1">{errors.ratePerSqFt}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="min-w-[120px] text-sm">Total Cost (Rs.)</Label>
            <Input
              name="totalCost"
              type="number"
              value={formData.totalCost || ""}
              onChange={handleChange}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Documents section - Updated version */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center bg-[#1F263E] text-white py-2 rounded-md">Documents</h2>
        {/* File upload inputs */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="mb-2 text-sm">Aadhar Card (Front)</Label>
            <Input
              ref={fileInputRefs.aadharCardFront}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleTempDocumentUpload(file, 'aadharCardFront');
              }}
              className="bg-white text-sm"
            />
          </div>
          <div>
            <Label className="mb-2 text-sm">Aadhar Card (Back)</Label>
            <Input
              ref={fileInputRefs.aadharCardBack}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleTempDocumentUpload(file, 'aadharCardBack');
              }}
              className="bg-white text-sm"
            />
          </div>
          <div>
            <Label className="mb-2 text-sm">PAN Card</Label>
            <Input
              ref={fileInputRefs.panCard}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleTempDocumentUpload(file, 'panCard');
              }}
              className="bg-white text-sm"
            />
          </div>
        </div>

        {/* Display existing documents */}
        {formData.documents?.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Uploaded Documents</h3>
            <div className="grid grid-cols-3 gap-4">
              {formData.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-[#f7f7f7] rounded">
                  <span className="capitalize text-sm">
                    {doc.type === 'aadharCardFront' ? 'Aadhar Front' :
                      doc.type === 'aadharCardBack' ? 'Aadhar Back' :
                        'PAN Card'}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTempDocuments(prev => [
                          ...prev.filter(d => d.type !== doc.type),
                          { type: doc.type, isDeleted: true }
                        ]);
                        setFormData(prev => ({
                          ...prev,
                          documents: prev.documents.filter(d => d.type !== doc.type)
                        }));
                      }}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display temporary documents */}
        {tempDocuments.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">New Documents</h3>
            <div className="grid grid-cols-3 gap-4">
              {tempDocuments.filter(doc => !doc.isDeleted).map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-[#f7f7f7] rounded">
                  <span className="capitalize text-sm">
                    {doc.type === 'aadharCardFront' ? 'Aadhar Front' :
                      doc.type === 'aadharCardBack' ? 'Aadhar Back' :
                        'PAN Card'}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        URL.revokeObjectURL(doc.previewUrl);
                        setTempDocuments(prev => prev.filter(d => d.type !== doc.type));
                        clearFileInput(doc.type);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
