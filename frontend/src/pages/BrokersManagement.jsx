import { useEffect, useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/utils";
import SearchInput from "@/components/SearchInput";
import Pagination from "@/components/Pagination";

export default function BrokersManagement() {
  const [brokers, setBrokers] = useState([]);
  const [editingBroker, setEditingBroker] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { auth } = useAuth();

  useEffect(() => {
    fetchBrokers();
  }, []);

  const fetchBrokers = async () => {
    try {
      const { data } = await apiClient.get("/brokers");
      if (!Array.isArray(data)) {
        console.error("Invalid data format received:", data);
        toast.error("Invalid data format received from server");
        setBrokers([]);
        return;
      }
      
      // Format the data
      const formattedBrokers = data.map(broker => ({
        _id: broker._id,
        name: broker.name || '',
        phoneNumber: broker.phoneNumber || '',
        address: broker.address || '',
        commission: broker.commission || 0,
        plots: Array.isArray(broker.plots) ? broker.plots : []
      }));

      console.log("Formatted brokers data:", formattedBrokers);
      setBrokers(formattedBrokers);
    } catch (error) {
      console.error("Failed to fetch brokers:", error);
      toast.error(error.response?.data?.message || "Failed to fetch brokers");
      setBrokers([]);
    }
  };

  const validateField = (name, value) => {
    let error = "";
    if (name === "name") {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(value)) {
        error = "Name should contain only alphabets.";
      }
    } else if (name === "phoneNumber") {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(value)) {
        error = "Phone number should be exactly 10 digits.";
      }
    } else if (name === "commission") {
      if (value < 0) {
        error = "Commission cannot be negative.";
      }
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this broker?")) return;
    try {
      await apiClient.delete(`/brokers/${id}`);
      setBrokers((prev) => prev.filter((broker) => broker._id !== id));
      toast.success("Broker deleted successfully");
    } catch (error) {
      toast.error("Failed to delete broker");
    }
  };

  const handleEdit = (broker) => {
    setEditingBroker(broker._id);
    setEditedData(broker);
  };

  const handleEditChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSave = async (brokerId) => {
    const isValid = Object.keys(editedData).every((key) =>
      validateField(key, editedData[key])
    );
    if (!isValid) {
      toast.error("Please fix validation errors");
      return;
    }

    try {
      // Only send required fields
      const brokerData = {
        name: editedData.name,
        phoneNumber: editedData.phoneNumber,
        address: editedData.address || '',
        commission: editedData.commission || 0
      };

      const { data } = await apiClient.put(`/brokers/${brokerId}`, brokerData);
      
      setBrokers(prev =>
        prev.map(broker =>
          broker._id === brokerId
            ? { ...data, plots: broker.plots }
            : broker
        )
      );
      
      setEditingBroker(null);
      setEditedData({});
      toast.success("Broker updated successfully");
    } catch (error) {
      console.error("Error updating broker:", error);
      toast.error(error.response?.data?.message || "Failed to update broker");
    }
  };

  const handleCancelEdit = () => {
    setEditingBroker(null);
    setEditedData({});
    setErrors({});
  };

  const filteredBrokers = brokers.filter((broker) =>
    (broker?.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const totalPages = Math.ceil(filteredBrokers.length / itemsPerPage);
  const paginatedBrokers = filteredBrokers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Brokers List</h1>
      </div>

      <SearchInput
        placeholder="Search brokers by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Commission (%)</TableHead>
            <TableHead>Plots</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedBrokers.map((broker) => (
            <TableRow key={broker._id}>
              <TableCell>
                {editingBroker === broker._id ? (
                  <Input
                    value={editedData.name}
                    onChange={(e) => handleEditChange("name", e.target.value)}
                    className="max-w-[200px]"
                  />
                ) : (
                  broker.name
                )}
              </TableCell>
              <TableCell>
                {editingBroker === broker._id ? (
                  <Input
                    value={editedData.phoneNumber}
                    onChange={(e) =>
                      handleEditChange("phoneNumber", e.target.value)
                    }
                    className="max-w-[150px]"
                  />
                ) : (
                  broker.phoneNumber
                )}
              </TableCell>
              <TableCell>
                {editingBroker === broker._id ? (
                  <Input
                    value={editedData.address}
                    onChange={(e) => handleEditChange("address", e.target.value)}
                    className="max-w-[200px]"
                  />
                ) : (
                  broker.address ? broker.address : "-"
                )}
              </TableCell>
              <TableCell>
                {editingBroker === broker._id ? (
                  <Input
                    type="number"
                    value={editedData.commission || ''}
                    onChange={(e) =>
                      handleEditChange("commission", Number(e.target.value))
                    }
                    className="max-w-[100px]"
                  />
                ) : (
                  broker.commission ? `${broker.commission}%` : '-'
                )}
              </TableCell>
              <TableCell>
                {broker.plots?.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {broker.plots.map((plot, index) => (
                      <span key={index} className="text-sm">
                        Plot {plot.plotNumber} ({plot.layoutId === 'layout1' ? 'Krishnam Nagar 1' : 'Krishnam Nagar 2'})
                      </span>
                    ))}
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {editingBroker === broker._id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSave(broker._id)}
                        className="h-8 px-2 lg:px-3"
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="h-8 px-2 lg:px-3"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Edit2
                        size={20}
                        className="cursor-pointer mt-0.5"
                        onClick={() => handleEdit(broker)}
                      />
                      {auth.user?.role === "superadmin" && (
                        <Trash2
                          color="#f00505"
                          className="cursor-pointer"
                          onClick={() => handleDelete(broker._id)}
                        />
                      )}
                    </>
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
