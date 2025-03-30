import { useState } from "react";
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
import { Trash2 } from "lucide-react";
import { useBuyers } from "@/context/BuyersContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import jsPDF from "jspdf";

export default function BuyersManagement() {
  const { buyers, deleteBuyer, updateBuyer, fetchBuyers } = useBuyers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this buyer?")) {
      deleteBuyer(id);
    }
  };

  const handleEdit = (buyer) => {
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
      alert("Please fix the errors before saving.");
      return;
    }

    try {
      await updateBuyer(selectedBuyer); // Trigger backend update
      setIsEditing(false); // Exit edit mode
      alert("Buyer details updated successfully");
      await fetchBuyers(); // Refresh the table with updated data
    } catch (error) {
      console.error("Error updating buyer details:", error);
      alert("Failed to update buyer details");
    }
  };

  const handleChange = (e) => {
    setSelectedBuyer({ ...selectedBuyer, [e.target.name]: e.target.value });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Buyer Details`, 10, 10);
    doc.text(`Name: ${selectedBuyer.buyerName}`, 10, 20);
    doc.text(`Address: ${selectedBuyer.address}`, 10, 30);
    doc.text(`Phone Number: ${selectedBuyer.phoneNumber}`, 10, 40);
    doc.text(`Gender: ${selectedBuyer.gender}`, 10, 50);
    doc.text(`Plot Number: ${selectedBuyer.plot.plotNumber}`, 10, 60);
    doc.text(`Total Cost: ${selectedBuyer.totalCost}`, 10, 70);
    doc.save(`${selectedBuyer.buyerName}_details.pdf`);
  };

  const filteredBuyers = buyers.filter((buyer) =>
    buyer.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Buyer Management</h1>

      <Input
        placeholder="Search buyers by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
          {selectedBuyer && (
            <div className="space-y-4 p-4">
              <DialogHeader>
                <DialogTitle>Buyer Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <label className="block font-medium">Name</label>
                {isEditing ? (
                  <>
                    <Input
                      name="buyerName"
                      value={selectedBuyer.buyerName}
                      onChange={handleChange}
                    />
                    {errors.buyerName && (
                      <p className="text-red-500 text-sm">{errors.buyerName}</p>
                    )}
                  </>
                ) : (
                  <p>{selectedBuyer.buyerName}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Address</label>
                {isEditing ? (
                  <>
                    <Input
                      name="address"
                      value={selectedBuyer.address}
                      onChange={(e) => {
                        if (e.target.value.split(" ").length <= 120) {
                          handleChange(e);
                        }
                      }}
                      className="break-words max-w-full"
                    />
                    <p className="text-gray-500 text-sm">
                      Max 120 words allowed.
                    </p>
                  </>
                ) : (
                  <p className="break-words max-w-full">
                    {selectedBuyer.address}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Phone Number</label>
                {isEditing ? (
                  <>
                    <Input
                      name="phoneNumber"
                      value={selectedBuyer.phoneNumber}
                      onChange={handleChange}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-sm">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </>
                ) : (
                  <p>{selectedBuyer.phoneNumber}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Gender</label>
                <p>{selectedBuyer.gender}</p>
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Plot Number</label>
                <p>{selectedBuyer.plot.plotNumber}</p>
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Total Cost</label>
                <p>{selectedBuyer.totalCost}</p>
              </div>
              <div className="flex space-x-4">
                {isEditing ? (
                  <Button onClick={handleSave}>Save</Button>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit</Button>
                )}
                <Button variant="outline" onClick={handleDownloadPDF}>
                  Download PDF
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
          {filteredBuyers.map((buyer) => (
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
                {new Date(buyer.plot.createdAt).toLocaleDateString()}
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
    </div>
  );
}
