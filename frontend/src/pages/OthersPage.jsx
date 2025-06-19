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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useLayout } from "@/context/LayoutContext";
import { apiClient } from "@/lib/utils";
import { Edit2, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import { pdf } from '@react-pdf/renderer';
import { Download } from "lucide-react";
import OthersPDF from "@/components/OthersPDF";

export default function OthersPage() {
  const { selectedLayout } = useLayout();
  const [Entries, setEntries] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currententry, setCurrententry] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { auth } = useAuth();
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    name: "",
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data } = await apiClient.get('/others');
      setEntries(data);
    } catch (error) {
      console.error("Failed to fetch Entries:", error);
      setEntries([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const entryData = {
        ...formData,
        amount: Number(formData.amount)
      };

      if (isEditMode && currententry) {
        await apiClient.put(`/others/${currententry._id}`, entryData);
        toast.success("Cost updated successfully");
      } else {
        await apiClient.post('/others', entryData);
        toast.success("Cost added successfully");
      }

      fetchEntries();
      handleCloseDialog();
    } catch (error) {
      toast.error(isEditMode ? "Failed to update cost" : "Failed to add cost");
    }
  };

  const handleEdit = (entry) => {
    setCurrententry(entry);
    setFormData({
      description: entry.description,
      amount: entry.amount,
      name: entry.name,
      date: new Date(entry.date).toISOString().split('T')[0],
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this cost?")) return;

    try {
      await apiClient.delete(`/others/${id}`);
      setEntries(Entries.filter(entry => entry._id !== id));
      toast.success("Cost deleted successfully");
    } catch (error) {
      toast.error("Failed to delete cost");
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setCurrententry(null);
    setFormData({
      description: "",
      amount: "",
      name: "",
      date: new Date().toISOString().split('T')[0],
    });
  };

  const filteredEntries = Entries.filter(entry =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDownloadStatement = async () => {
    try {
      const blob = await pdf(
        <OthersPDF
          entries={filteredEntries}
          selectedLayout={selectedLayout}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `others_statement_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate statement");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Others</h1>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleDownloadStatement}
          >
            <Download className="mr-2 h-4 w-4" />
            Statement
          </Button>
          <Button
            className="text-lg font-semibold capitalize cursor-pointer bg-[#1F263E]"
            onClick={() => setIsDialogOpen(true)}
          >
            Add New Entry
          </Button>
        </div>
      </div>

      <SearchInput
        placeholder="Search Entries by description"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-[600px] p-6 bg-white rounded-xl">
          <DialogHeader className="space-y-3 mb-6">
            <DialogTitle className="text-2xl font-semibold text-[#1F263E]">
              {isEditMode ? 'Edit entry' : 'Add New entry'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-[#f7f7f7] border-gray-200 focus:border-blue-500"
            />
            <Input
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="bg-[#f7f7f7] border-gray-200 focus:border-blue-500"
            />
            <Input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              min="0"
              className="bg-[#f7f7f7] border-gray-200 focus:border-blue-500"
            />
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="bg-[#f7f7f7] border-gray-200 focus:border-blue-500"
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="bg-white hover:bg-[#f7f7f7]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#1F263E] hover:bg-[#2A324D] text-white"
              >
                {isEditMode ? 'Update' : 'Add'} Entry
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sr. No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedEntries.map((entry, index) => (
            <TableRow key={entry._id}>
              <TableCell>{((currentPage - 1) * itemsPerPage) + index + 1}.</TableCell>
              <TableCell>{entry.name}</TableCell>
              <TableCell>{entry.description}</TableCell>
              <TableCell>Rs. {entry.amount}</TableCell>
              <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Edit2
                    className="cursor-pointer"
                    onClick={() => handleEdit(entry)}
                  />
                  {auth.user?.role === "superadmin" && (
                    <Trash2
                      color="#f00505"
                      className="cursor-pointer"
                      onClick={() => handleDelete(entry._id)}
                    />
                  )}
                </div>
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
