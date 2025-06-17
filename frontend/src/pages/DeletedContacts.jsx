import { useState, useEffect } from "react";
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
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";

export default function DeletedContacts() {
  const [deletedContacts, setDeletedContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { selectedLayout } = useLayout();
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
            <TableHead>Sr. No.</TableHead>
            <TableHead>Buyer Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Plot Number</TableHead>
            <TableHead>Deleted Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedContacts.map((contact, index) => (
            <TableRow key={contact._id}>
              <TableCell>{((currentPage - 1) * itemsPerPage) + index + 1}.</TableCell>
              <TableCell>{contact.buyerName}</TableCell>
              <TableCell>{contact.phoneNumber}</TableCell>
              <TableCell>{contact.plot.plotNumber}</TableCell>
              <TableCell>
                {new Date(contact.deletedAt).toLocaleDateString()}
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
