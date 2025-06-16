import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { generateStatementPDF, generatePaymentReceiptPDF } from "@/utils/pdfUtils";
import { useLayout } from "@/context/LayoutContext";
import PaymentsTable from "@/components/PaymentsTable";
import PaymentModal from "@/components/PaymentModal";

const x = 3;
export default function InvoiceDetails() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [subsequentPayment, setSubsequentPayment] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentType: "Cash",
    narration: "",
  });
  const [editingPaymentIndex, setEditingPaymentIndex] = useState(null);
  const { selectedLayout } = useLayout();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const { data } = await apiClient.get(`/invoices/${invoiceId}`);
      setInvoice(data);
    } catch (error) {
      toast.error("Failed to fetch invoice details");
      navigate("/invoices");
    }
  };

  const validateField = (name, value) => {
    let error = "";
    if (name === "amount") {
      if (!value || value <= 0) {
        error = "Amount must be greater than 0.";
      } else {
        const currentTotal = invoice.payments.reduce((sum, payment, idx) => {
          if (idx === editingPaymentIndex) return sum;
          return sum + payment.amount;
        }, 0);

        const newTotal = currentTotal + Number(value);
        if (newTotal > invoice.booking.totalCost) {
          error = "Total payments cannot exceed the plot cost.";
        }
      }
    } else if (name === "paymentDate") {
      if (!value) {
        error = "Payment date is required.";
      }
    }
    return error === "";
  };

  const handleAddOrEditPayment = async (paymentData) => {
    // Validate the payment data
    const isValid = validateField('amount', paymentData.amount) && 
                   validateField('paymentDate', paymentData.paymentDate);

    if (!isValid) return;

    try {
      if (!invoice?._id) {
        toast.error("Invoice ID not found");
        return;
      }

      const response = await apiClient.post(
        `/invoices/${invoice._id}/add-payment`,
        {
          ...paymentData,
          paymentIndex: editingPaymentIndex
        }
      );

      if (response?.data) {
        setInvoice(response.data);
        toast.success(
          editingPaymentIndex !== null
            ? "Payment updated successfully"
            : "Payment added successfully"
        );
        resetForm();
        setIsPaymentDialogOpen(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Failed to process payment");
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

  const handleDownloadInvoice = async () => {
    try {
      await generateStatementPDF(invoice, `invoice-${invoice.invoiceNumber}.pdf`, selectedLayout);
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  const handleDownloadPaymentReceipt = async (payment) => {
    try {
      await generatePaymentReceiptPDF(
        payment,
        invoice,
        `payment-receipt-${invoice.invoiceNumber}-${payment.id}.pdf`,
        selectedLayout
      );
    } catch (error) {
      toast.error("Failed to download payment receipt");
    }
  };

  const resetForm = () => {
    setEditingPaymentIndex(null);
    setSubsequentPayment({
      amount: "",
      paymentDate: new Date().toISOString().split('T')[0],
      paymentType: "Cash",
      narration: ""
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {invoice && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-[#1F263E]">
                Invoice Details
              </h1>
              <p className="text-gray-500">
                View and manage invoice information
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleDownloadInvoice}
              className="bg-white hover:bg-[#f7f7f7]"
            >
              <Download className="mr-2 h-4 w-4" />
              Statement
            </Button>
          </div>

          <div className="grid gap-6">
            <Card className="bg-[#1F263E] text-white">
              <CardContent>
                <label className="text-sm text-gray-500">Buyer Name</label>
                <p className="font-medium text-2xl">
                  {invoice?.booking?.buyerName}
                </p>
              </CardContent>
            </Card>

            <div className="bg-white rounded-lg shadow-md col-span-2  p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">Payment History</h2>
                <Button
                  onClick={() => setIsPaymentDialogOpen(true)}
                  className="bg-[#1F263E] text-white"
                >
                  Add Payment
                </Button>
              </div>

              <PaymentsTable
                payments={invoice.payments}
                onEditPayment={handleEditPayment}
                onDeletePayment={handleDeletePayment}
                onDownloadReceipt={handleDownloadPaymentReceipt}
              />
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
          </div>
        </div>
      )}
    </div>
  );
}
