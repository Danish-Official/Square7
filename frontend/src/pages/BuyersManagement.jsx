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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import { useLayout } from "@/context/LayoutContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function BuyersManagement() {
  const { buyers, deleteBuyer, setCurrentLayout } = useBuyers();
  const { selectedLayout } = useLayout();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
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
      toast.success("Buyer and associated data deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error?.response?.data?.message || "Failed to delete buyer");
    }
  };

  const handleViewDetails = (bookingId) => {
    navigate(`/booking/${bookingId}`);
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
      <h1 className="text-3xl font-semibold">Contact List</h1>

      <SearchInput
        placeholder="Search buyers by name"
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
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedBuyers.map((buyer) => (
            <TableRow key={buyer._id}>
              <TableCell
                className="cursor-pointer text-blue-500"
                onClick={() => handleViewDetails(buyer._id)}
              >
                {buyer.buyerName}
              </TableCell>
              <TableCell>{buyer.phoneNumber}</TableCell>
              <TableCell>{buyer.plot.plotNumber}</TableCell>
              <TableCell>
                {new Date(buyer.bookingDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {auth.user?.role === "superadmin" && (
                  <Trash2
                    color="#f00505"
                    className="cursor-pointer"
                    onClick={() => handleDelete(buyer._id)}
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
        onPageChange={handlePageChange}
      />
    </div>
  );
}
