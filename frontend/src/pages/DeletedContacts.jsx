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
import { toast } from "react-toastify";
import { useLayout } from "@/context/LayoutContext";
import { apiClient } from "@/lib/utils";
import { RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";

export default function DeletedContacts() {
  const [deletedContacts, setDeletedContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { selectedLayout } = useLayout();
  const { auth } = useAuth();
  const itemsPerPage = 10;

  const fetchDeletedContacts = async () => {
    try {
      const { data } = await apiClient.get('/deleted-contacts');
      setDeletedContacts(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch deleted contacts";
      toast.error(errorMessage);
      console.error("Error fetching deleted contacts:", error);
    }
  };

  useEffect(() => {
    if (selectedLayout) {
      fetchDeletedContacts();
    }
  }, [selectedLayout]);

  const handleRestore = async (id) => {
    if (!confirm("Are you sure you want to restore this contact?")) return;

    try {
      await apiClient.post(`/deleted-contacts/restore/${id}`);
      toast.success("Contact restored successfully");
      fetchDeletedContacts();
    } catch (error) {
      toast.error("Failed to restore contact");
    }
  };

  const filteredContacts = deletedContacts.filter((contact) =>
    contact.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Deleted Contacts</h1>

      <SearchInput
        placeholder="Search by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Buyer Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Plot Number</TableHead>
            <TableHead>Deleted Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedContacts.map((contact) => (
            <TableRow key={contact._id}>
              <TableCell>{contact.buyerName}</TableCell>
              <TableCell>{contact.phoneNumber}</TableCell>
              <TableCell>{contact.plot.plotNumber}</TableCell>
              <TableCell>
                {new Date(contact.deletedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {auth.user?.role === "superadmin" && (
                  <RotateCcw
                    className="cursor-pointer text-blue-500"
                    onClick={() => handleRestore(contact._id)}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
