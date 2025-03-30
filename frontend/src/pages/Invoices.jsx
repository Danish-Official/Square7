import { useEffect, useState } from "react";
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
import { apiClient } from "@/lib/utils";
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

export default function Invoices() {
  const [buyers, setBuyers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Add state for search term
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [subsequentPayment, setSubsequentPayment] = useState({
    amount: "",
    paymentDate: "",
    paymentType: "Cash",
  });
  const [editingPaymentIndex, setEditingPaymentIndex] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errors, setErrors] = useState({}); // Add state for errors

  useEffect(() => {
    fetchBuyers();
  }, []);

  async function fetchBuyers() {
    try {
      const { data } = await apiClient.get("/bookings");
      setBuyers(data);
    } catch (error) {
      console.error("Error fetching buyers", error);
    }
  }

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

  const handleAddOrEditPayment = () => {
    const isValid = ["amount", "paymentDate"].every((field) =>
      validateField(field, subsequentPayment[field])
    );
    if (!isValid) return;

    const updatedPayments = [...(selectedBuyer.subsequentPayments || [])];
    if (editingPaymentIndex !== null) {
      updatedPayments[editingPaymentIndex] = subsequentPayment;
    } else {
      updatedPayments.push(subsequentPayment);
    }

    setSelectedBuyer({
      ...selectedBuyer,
      subsequentPayments: updatedPayments,
    });
    setSubsequentPayment({ amount: "", paymentDate: "", paymentType: "Cash" });
    setEditingPaymentIndex(null);
    alert(
      editingPaymentIndex !== null
        ? "Payment updated successfully"
        : "Payment added successfully"
    );
  };

  const handleEditPayment = (index) => {
    setEditingPaymentIndex(index);
    setSubsequentPayment(selectedBuyer.subsequentPayments[index]);
  };

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();
    doc.text("Invoice Details", 10, 10);
    doc.text(`Buyer Name: ${selectedBuyer.buyerName}`, 10, 20);
    doc.text(`Address: ${selectedBuyer.address}`, 10, 30);
    doc.text(`Phone Number: ${selectedBuyer.phoneNumber}`, 10, 40);
    doc.text(`First Payment: $${selectedBuyer.firstPayment}`, 10, 50);
    doc.text("Subsequent Payments:", 10, 60);
    (selectedBuyer.subsequentPayments || []).forEach((payment, index) => {
      doc.text(
        `${index + 2}. $${payment.amount} on ${new Date(
          payment.paymentDate
        ).toLocaleDateString()} (${payment.paymentType})`,
        10,
        70 + index * 10
      );
    });
    doc.save(`Invoice_${selectedBuyer.buyerName}.pdf`);
  };

  const getOrdinalSuffix = (number) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const value = number % 100;
    return (
      number + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0])
    );
  };

  const filteredBuyers = buyers.filter((buyer) =>
    buyer.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
  ); // Filter buyers based on search term

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Invoice Management</h1>
      <Input
        placeholder="Search invoices by buyer name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />{" "}
      {/* Add search input */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Buyer Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBuyers.map((buyer) => (
            <TableRow key={buyer._id}>
              <TableCell>{buyer.buyerName}</TableCell>
              <TableCell>{buyer.phoneNumber}</TableCell>
              <TableCell>
                <Button
                  onClick={() => {
                    setSelectedBuyer({
                      ...buyer,
                      subsequentPayments: buyer.subsequentPayments || [],
                    });
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
          {selectedBuyer && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Invoice Details</DialogTitle>
              </DialogHeader>
              <p>
                <strong>Buyer Name:</strong> {selectedBuyer.buyerName}
              </p>
              <p>
                <strong>Address:</strong>
                <ul>
                  {selectedBuyer.address
                    .match(/.{1,50}/g)
                    .map((chunk, index) => (
                      <li key={index}>{chunk}</li>
                    ))}
                </ul>
              </p>
              <p>
                <strong>Phone Number:</strong> {selectedBuyer.phoneNumber}
              </p>
              <p>
                <strong>First Payment:</strong> ${selectedBuyer.firstPayment}
              </p>
              <h3 className="text-lg font-semibold">Subsequent Payments</h3>
              <ul>
                {selectedBuyer.subsequentPayments.map((payment, index) => (
                  <li key={index}>
                    <strong>{`${getOrdinalSuffix(index + 2)} Payment:`}</strong>{" "}
                    ${payment.amount} on{" "}
                    {new Date(payment.paymentDate).toLocaleDateString()} (
                    {payment.paymentType}){" "}
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
                  value={subsequentPayment.amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSubsequentPayment((prev) => ({
                      ...prev,
                      amount: value,
                    }));
                    validateField("amount", value);
                  }}
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm">{errors.amount}</p>
                )}
                <Input
                  placeholder="Payment Date"
                  type="date"
                  value={subsequentPayment.paymentDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSubsequentPayment((prev) => ({
                      ...prev,
                      paymentDate: value,
                    }));
                    validateField("paymentDate", value);
                  }}
                />
                {errors.paymentDate && (
                  <p className="text-red-500 text-sm">{errors.paymentDate}</p>
                )}
                <Select
                  onValueChange={(value) =>
                    setSubsequentPayment((prev) => ({
                      ...prev,
                      paymentType: value,
                    }))
                  }
                  value={subsequentPayment.paymentType}
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
