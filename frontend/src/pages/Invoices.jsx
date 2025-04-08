import { useState, useEffect } from "react"; // Added useEffect for fetching invoices
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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
import jsPDF from "jspdf";
import { apiClient } from "@/lib/utils"; // Import API client
import { toast } from "react-toastify"; // Import toast
import Pagination from "@/components/Pagination"; // Import Pagination
import SearchInput from "@/components/SearchInput";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]); // State for invoices
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null); // Updated to handle invoices
  const [subsequentPayment, setSubsequentPayment] = useState({
    amount: "",
    paymentDate: "",
    paymentType: "Cash",
  });
  const [editingPaymentIndex, setEditingPaymentIndex] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const itemsPerPage = 25; // Items per page

  useEffect(() => {
    fetchInvoices(); // Fetch invoices on component mount
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data } = await apiClient.get("/invoices"); // Fetch invoices from backend
      setInvoices(data);
    } catch (error) {
      toast.error("Failed to fetch invoices");
      setInvoices([]);
    }
  };

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
      const updatedPayments = [...(selectedInvoice?.payments || [])];
      if (editingPaymentIndex !== null) {
        updatedPayments[editingPaymentIndex] = subsequentPayment;
      } else {
        updatedPayments.push(subsequentPayment);
      }

      const updatedInvoice = {
        ...selectedInvoice,
        payments: updatedPayments,
      };

      await apiClient.post(`/invoices/${selectedInvoice?._id}/add-payment`, {
        ...subsequentPayment,
      }); // Sync with backend

      setSelectedInvoice(updatedInvoice);
      setSubsequentPayment({
        amount: "",
        paymentDate: "",
        paymentType: "Cash",
      });
      setEditingPaymentIndex(null);
      toast.success(
        editingPaymentIndex !== null
          ? "Payment updated successfully"
          : "Payment added successfully"
      ); // Show success toast
    } catch (error) {
      toast.error("Failed to update payment"); // Show error toast
    }
  };

  const handleEditPayment = (index) => {
    setEditingPaymentIndex(index);
    setSubsequentPayment(
      selectedInvoice?.payments?.[index] || {
        amount: "",
        paymentDate: "",
        paymentType: "Cash",
      }
    );
  };

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();
    doc.text("Invoice Details", 10, 10);
    doc.text(`Buyer Name: ${selectedInvoice?.booking?.buyerName}`, 10, 20);
    doc.text(`Phone Number: ${selectedInvoice?.booking?.phoneNumber}`, 10, 30);
    doc.text("Payments:", 10, 40);
    selectedInvoice?.payments?.forEach((payment, index) => {
      doc.text(
        `${index + 1}. $${payment?.amount} on ${new Date(
          payment?.paymentDate
        )?.toLocaleDateString()} (${payment?.paymentType})`,
        10,
        50 + index * 10
      );
    });
    doc.save(`Invoice_${selectedInvoice?.booking?.buyerName}.pdf`);
  };

  const getOrdinalSuffix = (number) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const value = number % 100;
    return (
      number + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0])
    );
  };

  const filteredInvoices = invoices?.filter((invoice) =>
    invoice?.booking?.buyerName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil((filteredInvoices?.length || 0) / itemsPerPage);
  const paginatedInvoices = filteredInvoices?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Invoice Management</h1>

      <SearchInput
        placeholder="Search invoices by buyer name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Buyer Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedInvoices?.map((invoice) => (
            <TableRow key={invoice?._id}>
              <TableCell>{invoice?.booking?.buyerName}</TableCell>
              <TableCell>{invoice?.booking?.phoneNumber}</TableCell>
              <TableCell>
                <Button
                  onClick={() => {
                    setSelectedInvoice(invoice);
                    setIsDialogOpen(true);
                  }}
                >
                  View Invoice
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
          {selectedInvoice && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Invoice Details</DialogTitle>
              </DialogHeader>
              <p>
                <strong>Buyer Name:</strong>{" "}
                {selectedInvoice?.booking?.buyerName}
              </p>
              <p>
                <strong>Phone Number:</strong>{" "}
                {selectedInvoice?.booking?.phoneNumber}
              </p>
              <h3 className="text-lg font-semibold">Payments</h3>
              <ul>
                {selectedInvoice?.payments?.map((payment, index) => (
                  <li key={index}>
                    <strong>{`${getOrdinalSuffix(index + 1)} Payment:`}</strong>{" "}
                    ${payment?.amount} on{" "}
                    {new Date(payment?.paymentDate)?.toLocaleDateString()} (
                    {payment?.paymentType}){" "}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPayment(index)}
                    >
                      Edit
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="space-y-2">
                <Input
                  placeholder="Amount"
                  type="number"
                  value={subsequentPayment?.amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSubsequentPayment((prev) => ({
                      ...prev,
                      amount: value,
                    }));
                    validateField("amount", value);
                  }}
                />
                {errors?.amount && (
                  <p className="text-red-500 text-sm">{errors?.amount}</p>
                )}
                <Input
                  placeholder="Payment Date"
                  type="date"
                  value={subsequentPayment?.paymentDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSubsequentPayment((prev) => ({
                      ...prev,
                      paymentDate: value,
                    }));
                    validateField("paymentDate", value);
                  }}
                />
                {errors?.paymentDate && (
                  <p className="text-red-500 text-sm">{errors?.paymentDate}</p>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddOrEditPayment}>
                  {editingPaymentIndex !== null
                    ? "Update Payment"
                    : "Add Payment"}
                </Button>
              </div>
              <div className="flex space-x-4">
                <Button onClick={handleDownloadInvoice}>
                  Download Invoice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
