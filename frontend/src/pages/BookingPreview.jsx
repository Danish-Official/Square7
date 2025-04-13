import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { setupPDF, addHeader, addField, addDivider } from "@/utils/pdfUtils";
import jsPDF from "jspdf";

export default function BookingPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  if (!bookingData) {
    navigate("/new-booking");
    return null;
  }

  const handleDownloadPDF = () => {
    const doc = setupPDF();
    addHeader(doc, "Booking Details");

    let y = 40;
    addField(doc, "Buyer Name:", bookingData.buyerName, y);
    addField(doc, "Address:", bookingData.address, (y += 15));
    addField(doc, "Phone Number:", bookingData.phoneNumber, (y += 15));
    addField(doc, "Gender:", bookingData.gender, (y += 15));

    addDivider(doc, (y += 10));

    addField(doc, "Plot Number:", bookingData.plotNumber, (y += 20));
    addField(doc, "Area (sq ft):", bookingData.areaSqFt, (y += 15));
    addField(doc, "Rate per sq ft:", `${bookingData.ratePerSqFt}`, (y += 15));
    addField(doc, "Total Cost:", `Rs. ${bookingData.totalCost}`, (y += 15));

    addDivider(doc, (y += 10));

    addField(doc, "First Payment:", `Rs. ${bookingData.firstPayment}`, (y += 20));
    addField(doc, "Payment Type:", bookingData.paymentType, (y += 15));

    if (bookingData.brokerReference) {
      addField(
        doc,
        "Broker Reference:",
        bookingData.brokerReference,
        (y += 15)
      );
    }

    doc.save(`booking_${bookingData.buyerName}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Booking Preview</h1>
        <Button
          onClick={handleDownloadPDF}
          className="bg-[#1F263E] hover:bg-[#2A324D] text-white"
        >
          Download PDF
        </Button>
      </div>

      <div className="space-y-6">
        {/* Personal Details Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-[#1F263E]">
            Personal Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-500">Buyer Name</h3>
              <p className="text-lg">{bookingData.buyerName}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Phone Number</h3>
              <p className="text-lg">{bookingData.phoneNumber}</p>
            </div>
            <div className="col-span-2">
              <h3 className="font-medium text-gray-500">Address</h3>
              <p className="text-lg">{bookingData.address}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Gender</h3>
              <p className="text-lg">{bookingData.gender}</p>
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
              <p className="text-lg">{bookingData.plotNumber}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Area (sq ft)</h3>
              <p className="text-lg">{bookingData.areaSqFt}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Rate per sq ft</h3>
              <p className="text-lg">₹{bookingData.ratePerSqFt}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Total Cost</h3>
              <p className="text-lg">₹{bookingData.totalCost}</p>
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
              <p className="text-lg">₹{bookingData.firstPayment}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Payment Type</h3>
              <p className="text-lg">{bookingData.paymentType}</p>
            </div>
            {bookingData.brokerReference && (
              <div>
                <h3 className="font-medium text-gray-500">Broker Reference</h3>
                <p className="text-lg">{bookingData.brokerReference}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
