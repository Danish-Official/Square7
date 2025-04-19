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
import { Trash2 } from "lucide-react"; // Add this import at the top
import { setupPDF, addHeader, addField, addDivider } from "@/utils/pdfUtils"; // Import PDF utility functions
import { useLayout } from "@/context/LayoutContext"; // Import useLayout hook

export default function Invoices() {
  const { selectedLayout } = useLayout();
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
  const itemsPerPage = 10; // Items per page

  useEffect(() => {
    if (!selectedLayout) {
      setInvoices([]);
      toast.error("Please select a layout first");
      return;
    }
    fetchInvoices();
  }, [selectedLayout]);

  const fetchInvoices = async () => {
    try {
      if (!selectedLayout) return;
      const { data } = await apiClient.get(`/invoices/layout/${selectedLayout}`);
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
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
      fetchInvoices(); // Fetch updated invoices
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

  const handleDeletePayment = async (index) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    try {
      await apiClient.delete(
        `/invoices/${selectedInvoice._id}/payments/${index}`
      );

      const updatedPayments = [...selectedInvoice.payments];
      updatedPayments.splice(index, 1);

      setSelectedInvoice((prev) => ({
        ...prev,
        payments: updatedPayments,
      }));

      toast.success("Payment deleted successfully");
      fetchInvoices(); // Fetch updated invoices
    } catch (error) {
      toast.error("Failed to delete payment");
    }
  };

  const handleDownloadInvoice = () => {
    const doc = setupPDF();
    addHeader(doc, "Invoice Details");

    let y = 40;
    addField(doc, "Buyer Name:", selectedInvoice?.booking?.buyerName, y);
    addField(
      doc,
      "Phone Number:",
      selectedInvoice?.booking?.phoneNumber,
      (y += 15)
    );

    addDivider(doc, (y += 10));

    // Payments Section
    doc.setFontSize(14);
    doc.setTextColor(31, 38, 62);
    doc.text("Payment History", 20, (y += 20));

    selectedInvoice?.payments?.forEach((payment, index) => {
      y += 15;
      const date = new Date(payment?.paymentDate)?.toLocaleDateString();
      const paymentText = `${getOrdinalSuffix(index + 1)} Payment:`;
      const paymentDetails = `Rs. ${payment?.amount} paid on ${date} (${payment?.paymentType})`;

      addField(doc, paymentText, paymentDetails, y);
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

      {selectedLayout ? (
        <>
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
                      className="bg-[#1F263E] hover:bg-[#2A324D] text-white"
                    >
                      View Details
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
            <DialogContent className="max-w-[600px] p-6 bg-white rounded-xl max-h-[80vh] overflow-y-auto">
              {selectedInvoice && (
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
                          {selectedInvoice?.booking?.buyerName}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm text-gray-500">
                          Phone Number
                        </label>
                        <p className="font-medium">
                          {selectedInvoice?.booking?.phoneNumber}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-[#1F263E]">Payments</h3>
                      <ul className="space-y-3">
                        {selectedInvoice?.payments?.map((payment, index) => (
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
                          className="bg-[#1F263E] hover:bg-[#2A324D] text-white"
                        >
                          {editingPaymentIndex !== null
                            ? "Update Payment"
                            : "Add Payment"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      onClick={handleDownloadInvoice}
                      className="bg-[#1F263E] hover:bg-[#2A324D] text-white"
                    >
                      Download Invoice
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="bg-white hover:bg-gray-50"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">Please select a layout to view invoices</p>
        </div>
      )}
    </div>
  );
}
