import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { pdf } from '@react-pdf/renderer';
import { FileText, Download, File, Receipt, CircleUserRound } from "lucide-react";
import BookingDetailsPDF from '@/components/BookingDetailsPDF';
import { apiClient } from "@/lib/utils";
import { toast } from "react-toastify";

export default function BookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState(null);

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Booking Details</h1>
        <Button
          onClick={handleDownloadDocument}
          className="bg-[#1F263E] hover:bg-[#2A324D] text-white flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>
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
                    onClick={() => handleDownloadDocument(doc.url)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
