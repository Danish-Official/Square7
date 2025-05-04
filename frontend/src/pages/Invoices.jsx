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
import { toast } from "react-toastify";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import { useLayout } from "@/context/LayoutContext";
import InvoiceDetailsModal from "@/components/InvoiceDetailsModal";

export default function Invoices() {
  const { selectedLayout } = useLayout();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      setLoading(true);
      
      const { data } = await apiClient.get(`/invoices/layout/${selectedLayout}`);
      
      if (!Array.isArray(data)) {
        console.error("Invalid response format:", data);
        toast.error("Invalid response from server");
        return;
      }

      // Filter and validate invoice data
      const validInvoices = data.filter(invoice => 
        invoice?.booking?.buyerName && 
        invoice?.booking?.phoneNumber &&
        invoice?.booking?.plot?.layoutId === selectedLayout
      );

      console.log("Valid invoices:", validInvoices); // Debug log
      setInvoices(validInvoices);
      
      if (validInvoices.length === 0) {
        toast.info("No invoices found for this layout");
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error(error.response?.data?.message || "Failed to fetch invoices");
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
              <Button 
                onClick={fetchInvoices} 
                className="mt-4 bg-[#1F263E] hover:bg-[#2A324D] text-white"
              >
                Refresh
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead className={"ps-20"}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInvoices?.map((invoice) => (
                    <TableRow key={invoice?._id}>
                      <TableCell>{invoice?.booking?.buyerName}</TableCell>
                      <TableCell>{invoice?.booking?.phoneNumber}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setIsDialogOpen(true);
                            }}
                            className="bg-[#1F263E] hover:bg-[#2A324D] text-white"
                          >
                            View Details
                          </Button>
                        </div>
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
          
          <InvoiceDetailsModal 
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            invoice={selectedInvoice}
            onInvoiceUpdated={fetchInvoices}
          />
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">Please select a layout to view invoices</p>
        </div>
      )}
    </div>
  );
}
