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
import { apiClient } from "@/lib/utils";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import { useLayout } from "@/context/LayoutContext";
import { useNavigate } from "react-router-dom";

export default function Invoices() {
  const { selectedLayout } = useLayout();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedLayout) {
      setInvoices([]);
      return;
    }
    fetchInvoices();
  }, [selectedLayout]);

  const fetchInvoices = async () => {
    try {
      if (!selectedLayout) return;
      setLoading(true);
      
      const { data } = await apiClient.get(`/invoices/layout/${selectedLayout}`);
      
      if (!Array.isArray(data)) {
        console.error("Invalid response format:", data);
        return;
      }

      // Filter and validate invoice data
      const validInvoices = data.filter(invoice => 
        invoice?.booking?.buyerName && 
        invoice?.booking?.phoneNumber &&
        invoice?.booking?.plot?.layoutId === selectedLayout
      );

      setInvoices(validInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter invoices with null checks
  const filteredInvoices = invoices.filter((invoice) => {
    const buyerName = invoice?.booking?.buyerName || '';
    const searchTermLower = searchTerm.toLowerCase();
    return buyerName.toLowerCase().includes(searchTermLower);
  });

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

          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No invoices found for this layout</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInvoices?.map((invoice) => (
                    <TableRow key={invoice?._id}>
                      <TableCell>{invoice?.booking?.buyerName}</TableCell>
                      <TableCell>{invoice?.booking?.phoneNumber}</TableCell>
                      <TableCell className="max-w-[350px] whitespace-normal break-words">
                        {invoice?.booking?.address || 'N/A'}
                      </TableCell>
                      <TableCell>
                          <Button
                            className="bg-[#1F263E] hover:bg-[#2A324D] text-white"
                            onClick={() => navigate(`/invoices/${invoice._id}`)}
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
            </>
          )}
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">Please select a layout to view invoices</p>
        </div>
      )}
    </div>
  );
}
