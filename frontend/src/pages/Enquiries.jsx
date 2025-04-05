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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

export default function Enquiries() {
  const { auth } = useAuth(); // Access auth from context
  const [enquiries, setEnquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEnquiry, setNewEnquiry] = useState({
    name: "",
    phoneNumber: "",
    message: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const { data } = await apiClient.get("/enquiries");
        setEnquiries(data);
      } catch (error) {
        console.error("Error fetching enquiries:", error);
      }
    };

    if (auth.token) {
      fetchEnquiries(); // Fetch enquiries when token is available
    }
  }, [auth.token]);

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
      const { data } = await apiClient.post("/enquiries", newEnquiry);
      setEnquiries((prev) => [...prev, data]);
      setIsDialogOpen(false);
      setNewEnquiry({ name: "", phoneNumber: "", message: "" });
      setErrors({});
      alert("Enquiry created successfully");
    } catch (error) {
      console.error("Error creating enquiry", error);
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
      alert("Enquiry deleted successfully");
    } catch (error) {
      console.error("Error deleting enquiry", error);
      alert("Failed to delete enquiry");
    }
  };

  const filteredEnquiries = enquiries.filter((enquiry) =>
    enquiry.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Enquiry Management</h1>

      <Input
        placeholder="Search enquiries by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      <Button onClick={() => setIsDialogOpen(true)}>Add Enquiry</Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Enquiry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              name="name"
              placeholder="Name"
              value={newEnquiry.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
            <Input
              name="phoneNumber"
              placeholder="Phone Number"
              value={newEnquiry.phoneNumber}
              onChange={handleChange}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
            )}
            <textarea
              name="message"
              placeholder="Message"
              value={newEnquiry.message}
              onChange={(e) => {
                if (e.target.value.split(" ").length <= 120) {
                  handleChange(e);
                }
              }}
              className="w-full p-2 border rounded-md break-words max-w-full"
              rows="4"
            />
            <p className="text-gray-500 text-sm">Max 120 words allowed.</p>
            {errors.message && (
              <p className="text-red-500 text-sm">{errors.message}</p>
            )}
            <Button onClick={handleCreateEnquiry}>Create</Button>
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
          {filteredEnquiries.map((enquiry) => (
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
                <Trash2
                  color="#f00505"
                  className="self-center"
                  onClick={() => handleDelete(enquiry._id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
