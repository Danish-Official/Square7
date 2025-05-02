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
import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "@/components/InvoicePDF";
import { apiClient } from "@/lib/utils";
import { toast } from "react-toastify";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import { useLayout } from "@/context/LayoutContext";
import InvoiceDetailsModal from "@/components/InvoiceDetailsModal";

export default function Invoices() {
  const { selectedLayout } = useLayout();
  const [invoices, setInvoices] = useState([]);
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
      const { data } = await apiClient.get(`/invoices/layout/${selectedLayout}`);
      // Ensure bookings are populated with plot details
      const populatedInvoices = data.map(invoice => ({
        ...invoice,
        booking: {
          ...invoice.booking,
          plot: invoice.booking.plot || {}
        }
      }));
      setInvoices(populatedInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to fetch invoices");
      setInvoices([]);
    }
  };

  const handleDownloadInvoice = async (invoice) => {
    const blob = await pdf(<InvoicePDF data={invoice} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice_${invoice?.booking?.buyerName}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredInvoices = invoices?.filter((invoice) =>
    invoice?.booking?.buyerName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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
                      <Button
                        onClick={() => handleDownloadInvoice(invoice)}
                        className="bg-[#1F263E] hover:bg-[#2A324D] text-white"
                      >
                        Download
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
