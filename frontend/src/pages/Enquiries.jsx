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
import { Trash2, Edit2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLayout } from "@/context/LayoutContext";
import { toast } from "react-toastify";
import Pagination from "@/components/Pagination";
import SearchInput from "@/components/SearchInput";
import { Input } from "@/components/ui/input";

export default function Enquiries() {
  const { auth } = useAuth();
  const { selectedLayout } = useLayout();
  const [enquiries, setEnquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEnquiry, setNewEnquiry] = useState({
    name: "",
    phoneNumber: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);

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
      if (!/^\d{10}$/.test(value)) {
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

  const handleCreateEnquiry = async () => {
    const isValid = Object.keys(newEnquiry).every((key) =>
      validateField(key, newEnquiry[key])
    );
    if (!isValid) return;

    try {
      const { data } = await apiClient.post("/enquiries", {
        ...newEnquiry,
        layoutId: selectedLayout,
      });
      setEnquiries((prev) => [...prev, data]);
      setIsDialogOpen(false);
      setNewEnquiry({ name: "", phoneNumber: "", message: "" });
      setErrors({});
      toast.success("Enquiry created successfully");
    } catch (error) {
      toast.error("Failed to create enquiry");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEnquiry((prev) => ({ ...prev, [name]: value }));
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
    setEditingEnquiry(enquiry);
    setIsEditDialogOpen(true);
  };

  const handleUpdateEnquiry = async () => {
    const isValid = Object.keys(editingEnquiry).every((key) =>
      validateField(key, editingEnquiry[key])
    );
    if (!isValid) return;

    try {
      const { data } = await apiClient.put(
        `/enquiries/${editingEnquiry._id}`,
        editingEnquiry
      );
      setEnquiries((prev) =>
        prev.map((item) => (item._id === data._id ? data : item))
      );
      setIsEditDialogOpen(false);
      setEditingEnquiry(null);
      setErrors({});
      toast.success("Enquiry updated successfully");
    } catch (error) {
      toast.error("Failed to update enquiry");
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Enquiry Management</h1>

      <SearchInput
        placeholder="Search enquiries by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      <Button onClick={() => setIsDialogOpen(true)}>Add Enquiry</Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[600px] p-6 bg-white rounded-xl">
          <DialogHeader className="space-y-3 mb-6">
            <DialogTitle className="text-2xl font-semibold text-[#1F263E]">
              Add Enquiry
            </DialogTitle>
            <p className="text-gray-500 text-sm font-normal">
              Fill in the details to create a new enquiry
            </p>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Input
                name="name"
                placeholder="Name"
                value={newEnquiry.name}
                onChange={handleChange}
                className="bg-gray-50 border-gray-200 focus:border-blue-500"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <Input
                name="phoneNumber"
                placeholder="Phone Number"
                value={newEnquiry.phoneNumber}
                onChange={handleChange}
                className="bg-gray-50 border-gray-200 focus:border-blue-500"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>
            <div>
              <textarea
                name="message"
                placeholder="Message"
                value={newEnquiry.message}
                onChange={(e) => {
                  if (e.target.value.split(" ").length <= 120) {
                    handleChange(e);
                  }
                }}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows="4"
              />
              <p className="text-gray-500 text-sm mt-1">
                Max 120 words allowed.
              </p>
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="bg-white hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateEnquiry}
                className="bg-[#1F263E] hover:bg-[#2A324D] text-white"
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[600px] p-6 bg-white rounded-xl">
          <DialogHeader className="space-y-3 mb-6">
            <DialogTitle className="text-2xl font-semibold text-[#1F263E]">
              Edit Enquiry
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Input
                name="name"
                placeholder="Name"
                value={editingEnquiry?.name || ""}
                onChange={(e) =>
                  setEditingEnquiry((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="bg-gray-50 border-gray-200 focus:border-blue-500"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <Input
                name="phoneNumber"
                placeholder="Phone Number"
                value={editingEnquiry?.phoneNumber || ""}
                onChange={(e) =>
                  setEditingEnquiry((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                className="bg-gray-50 border-gray-200 focus:border-blue-500"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>
            <div>
              <textarea
                name="message"
                placeholder="Message"
                value={editingEnquiry?.message || ""}
                onChange={(e) => {
                  if (e.target.value.split(" ").length <= 120) {
                    setEditingEnquiry((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }));
                  }
                }}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows="4"
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="bg-white hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateEnquiry}
                className="bg-[#1F263E] hover:bg-[#2A324D] text-white"
              >
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
          {paginatedEnquiries.map((enquiry) => (
            <TableRow key={enquiry._id}>
              <TableCell>{enquiry.name}</TableCell>
              <TableCell>{enquiry.phoneNumber}</TableCell>
              <TableCell>
                <ul>
                  {enquiry.message.match(/.{1,50}/g).map((chunk, index) => (
                    <li key={index}>{chunk}</li>
                  ))}
                </ul>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Edit2
                    className="cursor-pointer"
                    onClick={() => handleEdit(enquiry)}
                  />
                  <Trash2
                    color="#f00505"
                    className="cursor-pointer"
                    onClick={() => handleDelete(enquiry._id)}
                  />
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
    </div>
  );
}
