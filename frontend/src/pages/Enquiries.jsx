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

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEnquiries();
  }, []);

  async function fetchEnquiries() {
    try {
      const { data } = await apiClient.get("/enquiries"); // Ensure relative path
      setEnquiries(data);
    } catch (error) {
      console.error("Error fetching enquiries", error);
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      await apiClient.delete(`/enquiries/${id}`); // Ensure relative path
      alert("Enquiry deleted successfully");
      fetchEnquiries();
    } catch (error) {
      console.error("Error deleting enquiry", error);
    }
  };

  const filteredEnquiries = Array.isArray(enquiries)
    ? enquiries.filter((enquiry) =>
        enquiry.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Enquiry Management</h1>

      <Input
        placeholder="Search enquiries by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEnquiries.map((enquiry) => (
            <TableRow key={enquiry._id}>
              <TableCell>{enquiry.name}</TableCell>
              <TableCell>{enquiry.phoneNumber}</TableCell>
              <TableCell>{enquiry.message}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(enquiry._id)}
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
