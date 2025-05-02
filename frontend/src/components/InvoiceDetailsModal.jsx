import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Trash2, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/utils";
import { pdf } from "@react-pdf/renderer";
import SinglePaymentPDF from "@/components/SinglePaymentPDF";

export default function InvoiceDetailsModal({ 
  isOpen, 
  onClose, 
  invoice, 
  onInvoiceUpdated 
}) {
  const [localInvoice, setLocalInvoice] = useState(invoice);
  const [subsequentPayment, setSubsequentPayment] = useState({
    amount: "",
    paymentDate: "",
    paymentType: "Cash",
  });
  const [editingPaymentIndex, setEditingPaymentIndex] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setLocalInvoice(invoice);
  }, [invoice]);

  const validateField = (name, value) => {
    let error = "";
    if (name === "amount") {
      if (!value || value <= 0) {
        error = "Amount must be greater than 0.";
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
    const isValid = ["amount", "paymentDate"].every((field) =>
      validateField(field, subsequentPayment?.[field])
    );
    if (!isValid) return;

    try {
      if (!localInvoice?._id) {
        toast.error("Invoice ID not found");
        return;
      }

      const paymentData = {
        amount: Number(subsequentPayment.amount),
        paymentDate: new Date(subsequentPayment.paymentDate).toISOString(),
        paymentType: subsequentPayment.paymentType,
        paymentIndex: editingPaymentIndex
      };

      const response = await apiClient.post(
        `/invoices/${localInvoice._id}/add-payment`,
        paymentData
      );

      if (response?.data) {
        setLocalInvoice(response.data);
        onInvoiceUpdated();
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
    const payment = localInvoice?.payments?.[index];
    if (payment) {
      const formattedDate = new Date(payment.paymentDate).toISOString().split('T')[0];
      setSubsequentPayment({
        amount: payment.amount,
        paymentDate: formattedDate,
        paymentType: payment.paymentType
      });
      setEditingPaymentIndex(index);
    }
  };

  const handleDeletePayment = async (index) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    try {
      const response = await apiClient.delete(`/invoices/${localInvoice._id}/payments/${index}`);
      setLocalInvoice(response.data);
      onInvoiceUpdated();
      toast.success("Payment deleted successfully");
    } catch (error) {
      toast.error("Failed to delete payment");
    }
  };

  const handleDownloadPayment = async (payment, index) => {
    const blob = await pdf(
      <SinglePaymentPDF 
        data={{
          payment,
          paymentIndex: index,
          buyerName: localInvoice?.booking?.buyerName,
          plotNumber: localInvoice?.booking?.plot?.plotNumber
        }}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Payment_${index + 1}_${localInvoice?.booking?.buyerName}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setEditingPaymentIndex(null);
    setSubsequentPayment({
      amount: "",
      paymentDate: "",
      paymentType: "Cash",
    });
    setErrors({});
  };

  const getOrdinalSuffix = (number) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const value = number % 100;
    return (
      number + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0])
    );
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-6 bg-white rounded-xl max-h-[100vh] overflow-y-auto">
        {localInvoice && (
          <div className="space-y-6">
            <DialogHeader className="space-y-3 mb-6">
              <DialogTitle className="text-2xl font-semibold text-[#1F263E]">
                Invoice Details
              </DialogTitle>
              <p className="text-gray-500 text-sm font-normal">
                View and manage invoice information
              </p>
            </DialogHeader>
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm text-gray-500">Buyer Name</label>
                  <p className="font-medium">
                    {localInvoice?.booking?.buyerName}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-500">
                    Phone Number
                  </label>
                  <p className="font-medium">
                    {localInvoice?.booking?.phoneNumber}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-[#1F263E]">Payments</h3>
                <ul className="space-y-3">
                  {localInvoice?.payments?.map((payment, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{`${getOrdinalSuffix(
                          index + 1
                        )} Payment:`}</span>{" "}
                        <span>₹{payment?.amount}</span> on{" "}
                        <span>
                          {new Date(
                            payment?.paymentDate
                          )?.toLocaleDateString()}
                        </span>{" "}
                        <span>({payment?.paymentType})</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPayment(index)}
                          className="bg-white hover:bg-gray-50"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPayment(payment, index)}
                          className="bg-white hover:bg-gray-50"
                        >
                          <Download size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePayment(index)}
                          className="bg-white hover:bg-gray-50 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-[#1F263E]">Add Payment</h3>
                <div className="grid gap-4">
                  <Input
                    placeholder="Amount"
                    type="number"
                    value={subsequentPayment?.amount}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      const value =
                        rawValue === "" ? "" : Math.ceil(Number(rawValue));
                      setSubsequentPayment((prev) => ({
                        ...prev,
                        amount: value,
                      }));
                      validateField("amount", value);
                    }}
                    className="bg-white border-gray-200 focus:border-blue-500"
                  />
                  {errors?.amount && (
                    <p className="text-red-500 text-sm">{errors?.amount}</p>
                  )}
                  <Input
                    placeholder="Payment Date"
                    type="date"
                    value={subsequentPayment?.paymentDate}
                    onChange={(e) => {
                      setSubsequentPayment((prev) => ({
                        ...prev,
                        paymentDate: e.target.value,
                      }));
                      validateField("paymentDate", e.target.value);
                    }}
                    className="bg-white border-gray-200 focus:border-blue-500"
                  />
                  {errors?.paymentDate && (
                    <p className="text-red-500 text-sm">
                      {errors?.paymentDate}
                    </p>
                  )}
                  <Select
                    onValueChange={(value) =>
                      setSubsequentPayment((prev) => ({
                        ...prev,
                        paymentType: value,
                      }))
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
                  <Button
                    onClick={handleAddOrEditPayment}
                    className="bg-[#1F263E] hover:bg-[#2A324D] text-white mt-2"
                  >
                    {editingPaymentIndex !== null ? "Update Payment" : "Add Payment"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="bg-white hover:bg-gray-50"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
