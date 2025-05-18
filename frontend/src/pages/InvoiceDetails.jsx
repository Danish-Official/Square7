import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Download, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { generateStatementPDF, generatePaymentReceiptPDF } from "@/utils/pdfUtils";
import { useLayout } from "@/context/LayoutContext";

const x = 3;
export default function InvoiceDetails() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [subsequentPayment, setSubsequentPayment] = useState({
    amount: "",
    paymentDate: "",
    paymentType: "Cash",
    narration: "",
  });
  const [editingPaymentIndex, setEditingPaymentIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const { auth } = useAuth();
  const { selectedLayout } = useLayout();

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
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleAddOrEditPayment = async () => {
    const isValid = Object.entries(subsequentPayment).every(([field, value]) =>
      validateField(field, value)
    );

    if (!isValid) return;

    try {
      if (!invoice?._id) {
        toast.error("Invoice ID not found");
        return;
      }

      const paymentData = {
        amount: Number(subsequentPayment.amount),
        paymentDate: new Date(subsequentPayment.paymentDate).toISOString(),
        paymentType: subsequentPayment.paymentType,
        paymentIndex: editingPaymentIndex,
        narration: subsequentPayment.narration
      };

      const response = await apiClient.post(
        `/invoices/${invoice._id}/add-payment`,
        paymentData
      );

      if (response?.data) {
        setInvoice(response.data);
        toast.success(
          editingPaymentIndex !== null
            ? "Payment updated successfully"
            : "Payment added successfully"
        );
        resetForm();
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

      // Scroll to add payment section
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
      paymentDate: "",
      paymentType: "Cash",
      narration: ""
    });
    setErrors({});
  };

  const getOrdinalSuffix = (number) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const value = number % 100;
    return number + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
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
            <Card>
              <CardHeader>
                <CardTitle>Buyer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm text-gray-500">Buyer Name</label>
                    <p className="font-medium">
                      {invoice?.booking?.buyerName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-gray-500">
                      Phone Number
                    </label>
                    <p className="font-medium">
                      {invoice?.booking?.phoneNumber}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {invoice?.payments?.map((payment, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-[#f7f7f7] p-3 rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{`${getOrdinalSuffix(index + 1)} Payment:`}</span>{" "}
                        <span>₹{payment?.amount}</span> on{" "}
                        <span>{new Date(payment?.paymentDate)?.toLocaleDateString()}</span>{" "}
                        <span>({payment?.paymentType})</span>
                        {payment?.narration && <span> - {payment.narration}</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPayment(index)}
                          className="bg-white hover:bg-[#f7f7f7]"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPaymentReceipt(payment)}
                          className="bg-white hover:bg-[#f7f7f7]"
                        >
                          <Download size={16} />
                        </Button>
                        {auth.user?.role === "superadmin" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePayment(index)}
                            className="bg-white hover:bg-[#f7f7f7] text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 bg-[#f7f7f7] p-4 rounded-lg">
                  <div className="grid gap-4">
                    <Input
                      placeholder="Amount"
                      type="number"
                      value={subsequentPayment?.amount}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        const value = rawValue === "" ? "" : Math.ceil(Number(rawValue));
                        setSubsequentPayment((prev) => ({ ...prev, amount: value }));
                        validateField("amount", value);
                      }}
                      className="bg-white border-gray-200 focus:border-blue-500"
                    />
                    {errors?.amount && <p className="text-red-500 text-sm">{errors?.amount}</p>}
                    <Input
                      placeholder="Payment Date"
                      type="date"
                      value={subsequentPayment?.paymentDate}
                      onChange={(e) => {
                        setSubsequentPayment((prev) => ({ ...prev, paymentDate: e.target.value }));
                        validateField("paymentDate", e.target.value);
                      }}
                      className="bg-white border-gray-200 focus:border-blue-500"
                    />
                    {errors?.paymentDate && <p className="text-red-500 text-sm">{errors?.paymentDate}</p>}
                    <Select
                      onValueChange={(value) =>
                        setSubsequentPayment((prev) => ({ ...prev, paymentType: value }))
                      }
                      value={subsequentPayment?.paymentType}
                    >
                      <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500">
                        <SelectValue placeholder="Payment Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="narration"
                      name="narration"
                      value={subsequentPayment.narration}
                      onChange={(e) =>
                        setSubsequentPayment((prev) => ({ ...prev, narration: e.target.value }))
                      }
                      placeholder="Enter payment details (e.g., Cheque number, Transaction ID)"
                      className="bg-white text-black"
                    />
                    <Button
                      onClick={handleAddOrEditPayment}
                      className="bg-[#1F263E] hover:bg-[#2A324D] text-white mt-2"
                    >
                      {editingPaymentIndex !== null ? "Update Payment" : "Add Payment"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
