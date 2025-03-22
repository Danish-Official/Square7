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
import axios from "axios";

export default function BuyersManagement() {
  const [buyers, setBuyers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBuyer, setEditingBuyer] = useState(null);

  useEffect(() => {
    fetchBuyers();
  }, []);

  async function fetchBuyers() {
    try {
      const { data } = await axios.get("/api/bookings"); // Ensure relative path
      setBuyers(data);
    } catch (error) {
      console.error("Error fetching buyers", error);
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this buyer?")) return;
    try {
      await axios.delete(`/api/bookings/${id}`); // Ensure relative path
      alert("Buyer deleted successfully");
      fetchBuyers();
    } catch (error) {
      console.error("Error deleting buyer", error);
    }
  };

  const handleEdit = (buyer) => {
    setEditingBuyer(buyer);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/bookings/${editingBuyer._id}`, editingBuyer); // Ensure relative path
      alert("Buyer updated successfully");
      setEditingBuyer(null);
      fetchBuyers();
    } catch (error) {
      console.error("Error updating buyer", error);
    }
  };

  const handleChange = (e) => {
    setEditingBuyer({ ...editingBuyer, [e.target.name]: e.target.value });
  };

  const filteredBuyers = Array.isArray(buyers)
    ? buyers.filter((buyer) =>
        buyer.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Buyer Management</h1>

      <Input
        placeholder="Search buyers by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      {editingBuyer && (
        <div className="space-y-4 p-4 border rounded-lg">
          <h2 className="text-2xl">Edit Buyer</h2>
          <Input
            name="buyerName"
            value={editingBuyer.buyerName}
            onChange={handleChange}
            placeholder="Buyer Name"
          />
          <Input
            name="address"
            value={editingBuyer.address}
            onChange={handleChange}
            placeholder="Address"
          />
          <Input
            name="phoneNumber"
            value={editingBuyer.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
          />
          <Button onClick={handleUpdate}>Save Changes</Button>
          <Button variant="outline" onClick={() => setEditingBuyer(null)}>
            Cancel
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Buyer Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Plot Number</TableHead>
            <TableHead>Total Cost</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBuyers.map((buyer) => (
            <TableRow key={buyer._id}>
              <TableCell>{buyer.buyerName}</TableCell>
              <TableCell>{buyer.address}</TableCell>
              <TableCell>{buyer.phoneNumber}</TableCell>
              <TableCell>{buyer.gender}</TableCell>
              <TableCell>{buyer.plot.plotNumber}</TableCell>
              <TableCell>${buyer.totalCost}</TableCell>
              <TableCell className="flex gap-2">
                <Button variant="outline" onClick={() => handleEdit(buyer)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(buyer._id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
