import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { useBuyers } from "@/context/BuyersContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import { setupPDF, addHeader, addField, addDivider } from "@/utils/pdfUtils";
import { useLayout } from "@/context/LayoutContext";

export default function BuyersManagement() {
  const { buyers, deleteBuyer, updateBuyer, setCurrentLayout } = useBuyers();
  const { selectedLayout } = useLayout();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (selectedLayout) {
      setCurrentLayout(selectedLayout);
    }
  }, [selectedLayout, setCurrentLayout]);

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this buyer? This will also delete associated invoice."
      )
    )
      return;

    try {
      await deleteBuyer(id);
      setIsDialogOpen(false);
      setSelectedBuyer(null);
      toast.success("Buyer and associated data deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error?.response?.data?.message || "Failed to delete buyer");
    }
  };

  const handleEdit = (buyer) => {
    if (!buyer) {
      toast.error("Invalid buyer data");
      return;
    }
    setSelectedBuyer(buyer);
    setIsDialogOpen(true);
    setIsEditing(false); // Start in view mode
  };

  const handleSave = async () => {
    const errors = {};
    if (
      !selectedBuyer.buyerName ||
      !/^[A-Za-z\s]+$/.test(selectedBuyer.buyerName)
    ) {
      errors.buyerName = "Name should contain only alphabets and spaces.";
    }
    if (
      !selectedBuyer.phoneNumber ||
      !/^\d{10}$/.test(selectedBuyer.phoneNumber)
    ) {
      errors.phoneNumber = "Phone number should be exactly 10 digits.";
    }
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      toast.error("Please fix the errors before saving."); // Show error toast
      return;
    }

    try {
      await updateBuyer(selectedBuyer); // Trigger backend update
      setIsEditing(false); // Exit edit mode
      toast.success("Buyer details updated successfully"); // Show success toast
    } catch (error) {
      toast.error("Failed to update buyer details");
    }
  };

  const handleChange = (e) => {
    setSelectedBuyer({ ...selectedBuyer, [e.target.name]: e.target.value });
  };

  const handleDownloadPDF = () => {
    const doc = setupPDF();
    addHeader(doc, "Buyer Details");

    let y = 40;
    addField(doc, "Name:", selectedBuyer.buyerName, y);
    addField(doc, "Address:", selectedBuyer.address, (y += 15));
    addField(doc, "Phone Number:", selectedBuyer.phoneNumber, (y += 15));
    addField(doc, "Gender:", selectedBuyer.gender, (y += 15));

    addDivider(doc, (y += 10));

    addField(doc, "Plot Number:", selectedBuyer.plot.plotNumber, (y += 20));
    addField(doc, "Total Cost:", `Rs. ${selectedBuyer.totalCost}`, (y += 15));

    doc.save(`${selectedBuyer.buyerName}_details.pdf`);
  };

  const filteredBuyers = buyers.filter((buyer) =>
    buyer.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBuyers.length / itemsPerPage);
  const paginatedBuyers = filteredBuyers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Buyer Management</h1>

      <SearchInput
        placeholder="Search buyers by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[600px] p-6 bg-white rounded-xl max-h-[80vh] overflow-y-auto">
          {selectedBuyer && (
            <div className="space-y-6">
              <DialogHeader className="space-y-3 mb-6">
                <DialogTitle className="text-2xl font-semibold text-[#1F263E]">
                  Buyer Details
                </DialogTitle>
                <p className="text-gray-500 text-sm font-normal">
                  View and manage buyer information
                </p>
              </DialogHeader>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="font-medium text-gray-700">Name</label>
                  {isEditing ? (
                    <>
                      <Input
                        name="buyerName"
                        value={selectedBuyer.buyerName}
                        onChange={handleChange}
                        className="bg-gray-50 border-gray-200 focus:border-blue-500"
                      />
                      {errors.buyerName && (
                        <p className="text-red-500 text-sm">
                          {errors.buyerName}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-900">{selectedBuyer.buyerName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-gray-700">Address</label>
                  {isEditing ? (
                    <>
                      <Input
                        name="address"
                        value={selectedBuyer.address}
                        onChange={handleChange}
                        className="bg-gray-50 border-gray-200 focus:border-blue-500"
                      />
                    </>
                  ) : (
                    <p className="text-gray-900 break-words">
                      {selectedBuyer.address}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-gray-700">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <>
                      <Input
                        name="phoneNumber"
                        value={selectedBuyer.phoneNumber}
                        onChange={handleChange}
                        className="bg-gray-50 border-gray-200 focus:border-blue-500"
                      />
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-sm">
                          {errors.phoneNumber}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-900">{selectedBuyer.phoneNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-medium text-gray-700">Gender</label>
                    <p className="text-gray-900">{selectedBuyer.gender}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium text-gray-700">
                      Plot Number
                    </label>
                    <p className="text-gray-900">
                      {selectedBuyer.plot.plotNumber}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-medium text-gray-700">
                    Total Cost
                  </label>
                  <p className="text-gray-900">₹{selectedBuyer.totalCost}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                {isEditing ? (
                  <Button
                    onClick={handleSave}
                    className="bg-[#1F263E] hover:bg-[#2A324D] text-white"
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#1F263E] hover:bg-[#2A324D] text-white"
                  >
                    Edit
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="bg-white hover:bg-gray-50"
                >
                  Download PDF
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Buyer Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Plot Number</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedBuyers.map((buyer) => (
            <TableRow key={buyer._id}>
              <TableCell
                className="cursor-pointer text-blue-500"
                onClick={() => handleEdit(buyer)}
              >
                {buyer.buyerName}
              </TableCell>
              <TableCell>{buyer.phoneNumber}</TableCell>
              <TableCell>{buyer.plot.plotNumber}</TableCell>
              <TableCell>
                {new Date(buyer.bookingDate).toLocaleDateString()}{" "}
                {/* Use bookingDate */}
              </TableCell>
              <TableCell>
                <Trash2
                  color="#f00505"
                  className="self-center"
                  onClick={() => handleDelete(buyer._id)}
                />
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
    </div>
  );
}
