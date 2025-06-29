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
import { apiClient } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Edit2, Download, CircleUser, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLayout } from "@/context/LayoutContext";
import { toast } from "react-toastify";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import { Input } from "@/components/ui/input";
import { pdf } from "@react-pdf/renderer";
import EnquiriesPDF from "@/components/EnquiriesPDF";

export default function Enquiries() {
  const { auth } = useAuth();
  const { selectedLayout } = useLayout();
  const [enquiries, setEnquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    message: "",
    date: new Date().toISOString().split('T')[0],
    address: "", // Add address field
  });
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const { data } = await apiClient.get(`/enquiries/layout/${selectedLayout}`);
        setEnquiries(data);
      } catch (error) {
        toast.error("Failed to fetch enquiries");
      }
    };

    if (auth.token && selectedLayout) {
      fetchEnquiries();
    }
  }, [auth.token, selectedLayout]);

  const validateField = (name, value) => {
    let error = "";
    if (name === "name") {
      if (!/^[A-Za-z\s]+$/.test(value)) {
        error = "Name should contain only alphabets and spaces.";
      }
    } else if (name === "phoneNumber") {
      if (!value) {
        error = "Phone number is required.";
      } else if (!/^\d{10}$/.test(value)) {
        error = "Phone number should be exactly 10 digits.";
      }
    } else if (name === "message") {
      if (!value.trim()) {
        error = "Message cannot be empty.";
      }
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleSubmit = async () => {
    const isValid = Object.keys(formData).every((key) =>
      validateField(key, formData[key])
    );
    if (!isValid) return;

    try {
      if (editingEnquiry) {
        const { data } = await apiClient.put(`/enquiries/${editingEnquiry._id}`, {
          ...formData,
          layoutId: selectedLayout,
        });
        setEnquiries(prev => prev.map(item =>
          item._id === data._id ? data : item
        ));
        toast.success("Enquiry updated successfully");
      } else {
        const { data } = await apiClient.post("/enquiries", {
          ...formData,
          layoutId: selectedLayout,
        });
        setEnquiries(prev => [...prev, data]);
        toast.success("Enquiry created successfully");
      }
      handleCloseDialog();
    } catch (error) {
      toast.error(editingEnquiry ? "Failed to update enquiry" : "Failed to create enquiry");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      await apiClient.delete(`/enquiries/${id}`);
      setEnquiries((prev) => prev.filter((enquiry) => enquiry._id !== id));
      toast.success("Enquiry deleted successfully");
    } catch (error) {
      toast.error("Failed to delete enquiry");
    }
  };

  const handleEdit = (enquiry) => {
    setFormData({
      name: enquiry.name,
      phoneNumber: enquiry.phoneNumber,
      message: enquiry.message,
      date: new Date(enquiry.date).toISOString().split('T')[0],
      address: enquiry.address || "", // Set address for editing
    });
    setEditingEnquiry(enquiry);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEnquiry(null);
    setFormData({
      name: "",
      phoneNumber: "",
      message: "",
      date: new Date().toISOString().split('T')[0],
      address: "",
    });
    setErrors({});
  };

  const handleDownloadStatement = async () => {
    try {
      const blob = await pdf(
        <EnquiriesPDF
          enquiries={filteredEnquiries}
          selectedLayout={selectedLayout}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `enquiries_statement_${selectedLayout}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate statement");
    }
  };

  const filteredEnquiries = enquiries.filter((enquiry) =>
    enquiry.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage);
  const paginatedEnquiries = filteredEnquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleNameClick = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setDetailsModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Enquiry Management</h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleDownloadStatement}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Enquiries
          </Button>
          <Button
            className="text-lg font-semibold capitalize cursor-pointer bg-[#1F263E]"
            onClick={() => setIsDialogOpen(true)}
          >
            Add Enquiry
          </Button>
        </div>
      </div>
      <SearchInput
        placeholder="Search enquiries by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-[600px] p-6 bg-[#1F263E] rounded-xl">
          <DialogHeader className="space-y-3 mb-6 text-white">
            <DialogTitle className="text-2xl font-semibold">
              {editingEnquiry ? 'Edit Enquiry' : 'Add Enquiry'}
            </DialogTitle>
            <p className="text-sm font-normal">
              Fill in the details to {editingEnquiry ? 'update' : 'create'} an enquiry
            </p>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Input
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                className="bg-[#f7f7f7] border-gray-200 focus:border-blue-500"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <Input
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="bg-[#f7f7f7] border-gray-200 focus:border-blue-500"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>
            <div>
              <Input
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="bg-[#f7f7f7] border-gray-200 focus:border-blue-500"
              />
            </div>
            <div>
              <textarea
                name="message"
                placeholder="Message"
                value={formData.message}
                onChange={(e) => {
                  if (e.target.value.split(" ").length <= 120) {
                    handleChange(e);
                  }
                }}
                className="w-full p-2 bg-[#f7f7f7] border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows="2"
              />
              <p className=" text-white text-sm mt-1">
                Max 120 words allowed.
              </p>
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
              )}
            </div>
            <div>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange({ target: { name: 'date', value: e.target.value } })
                }
                required
                className="bg-[#f7f7f7] border-gray-200 focus:border-blue-500"
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                className="bg-white hover:bg-[#f7f7f7]"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleSubmit}
                className="bg-white hover:bg-[#f7f7f7]"
              >
                {editingEnquiry ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sr. No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedEnquiries.map((enquiry, index) => (
            <TableRow key={enquiry._id}>
              <TableCell>{((currentPage - 1) * itemsPerPage) + index + 1}.</TableCell>
              <TableCell>{enquiry.name}</TableCell>
              <TableCell>{enquiry.phoneNumber}</TableCell>
              <TableCell>
                <ul>
                  {enquiry.message.match(/.{1,50}/g).map((chunk, index) => (
                    <li key={index}>{chunk}</li>
                  ))}
                </ul>
              </TableCell>
              <TableCell>{new Date(enquiry.date).toLocaleDateString()}</TableCell>
              <TableCell>{enquiry.address}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Edit2
                    className="cursor-pointer"
                    onClick={() => handleEdit(enquiry)}
                  />
                  <Download
                    className="cursor-pointer"
                    onClick={async () => {
                      try {
                        const blob = await pdf(
                          <EnquiriesPDF enquiries={[enquiry]} selectedLayout={selectedLayout} />
                        ).toBlob();
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `enquiry_${enquiry._id}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      } catch (error) {
                        toast.error("Failed to download enquiry PDF");
                      }
                    }}
                  />
                  <Send className="cursor-pointer" />
                  {auth.user?.role === "superadmin" && (
                    <Trash2
                      color="#f00505"
                      className="cursor-pointer"
                      onClick={() => handleDelete(enquiry._id)}
                    />)}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        {selectedEnquiry && (
          <DialogContent className="max-w-[500px] p-6 bg-[#1F263E] text-white rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-4xl font-light uppercase mb-6 flex justify-center items-center gap-1"><CircleUser size={80} strokeWidth={1} /> {selectedEnquiry?.name?.split(" ")[0]}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 ms-6">
              <h2>Personal Details</h2>
              <div className="flex items-center">
                <label className="text-sm text-gray-400 w-1/3">Name:</label>
                <p className="font-medium flex-1">{selectedEnquiry.name}</p>
              </div>
              <div className="flex items-center">
                <label className="text-sm text-gray-400 w-1/3">Phone Number:</label>
                <p className="font-medium flex-1">{selectedEnquiry.phoneNumber}</p>
              </div>
              <div className="flex items-center">
                <label className="text-sm text-gray-400 w-1/3">Date:</label>
                <p className="font-medium flex-1">
                  {new Date(selectedEnquiry.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center">
                <label className="text-sm text-gray-400 w-1/3">Address:</label>
                <p className="font-medium flex-1">{selectedEnquiry.address || 'Not provided'}</p>
              </div>
              <div className="flex">
                <label className="text-sm text-gray-400 w-1/3">Message:</label>
                <p className="font-medium flex-1 whitespace-pre-wrap">{selectedEnquiry.message}</p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}