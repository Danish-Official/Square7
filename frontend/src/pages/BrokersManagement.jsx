import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "react-toastify";
import {apiClient} from "@/lib/utils";

import { Button } from "@/components/ui/button";
import SearchInput from "@/components/SearchInput";
import Pagination from "@/components/Pagination";
import { generateBrokersPDF } from "@/utils/pdfUtils";
import { useLayout } from "@/context/LayoutContext";
import BrokersTable from "@/components/BrokersTable";
import { useAuth } from "@/context/AuthContext";

export default function BrokersManagement() {
  const [brokers, setBrokers] = useState([]);
  const [editingBroker, setEditingBroker] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { auth } = useAuth();
  const { selectedLayout } = useLayout();

  const calculateBrokerFinancials = (broker) => {
    if (!broker || !broker.totalCost) return null;

    const commission = broker.commission || 0;
    const tdsPercentage = broker.tdsPercentage || 5;
    const amount = (broker.totalCost * commission) / 100;
    const tdsAmount = (amount * tdsPercentage) / 100;
    const netAmount = amount - tdsAmount;

    return {
      amount: Math.round(amount),
      tdsAmount: Math.round(tdsAmount),
      netAmount: Math.round(netAmount),
      commission,
      tdsPercentage
    };
  };

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        const { data } = await apiClient.get("/brokers");
        if (!Array.isArray(data)) {
          toast.error("Invalid data format received from server");
          setBrokers([]);
          return;
        }
        const formattedBrokers = data.map(broker => ({
          ...broker,
          ...calculateBrokerFinancials(broker)
        }));
        setBrokers(formattedBrokers);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch brokers");
        setBrokers([]);
      }
    };
    fetchBrokers();
  }, []);

  const validateField = (name, value) => {
    let error = "";
    if (name === "name") {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(value)) {
        error = "Name should contain only alphabets.";
      }
    } else if (name === "phoneNumber") {
      if (value && !/^\d{10}$/.test(value)) {
        error = "Phone number should be exactly 10 digits.";
      }
    } else if (name === "commission") {
      if (value < 0) {
        error = "Commission cannot be negative.";
      }
    } else if (name === "tdsPercentage") {
      if (value < 0) {
        error = "TDS percentage cannot be negative.";
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
    setEditedData({
      name: broker.name,
      phoneNumber: broker.phoneNumber,
      commission: broker.commission,
      tdsPercentage: broker.tdsPercentage,
      date: broker.date
    });
    setErrors({});
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
      // Find existing broker data
      const existingBroker = brokers.find(b => b._id === brokerId);

      // Merge existing data with edited data
      const brokerData = {
        ...existingBroker,
        name: editedData.name,
        phoneNumber: editedData.phoneNumber,
        commission: editedData.commission ?? existingBroker.commission,
        tdsPercentage: editedData.tdsPercentage ?? existingBroker.tdsPercentage,
        date: editedData.date ?? existingBroker.date
      };

      const { data } = await apiClient.put(`/brokers/${brokerId}`, brokerData);

      // Update local state immediately
      setBrokers(prev =>
        prev.map(broker =>
          broker._id === brokerId
            ? { ...broker, ...data, plots: broker.plots }
            : broker
        )
      );

      handleCancelEdit();
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

  const handleDownloadPDF = async () => {
    try {
      // Pass filtered brokers with their financial calculations
      const brokersWithFinancials = filteredBrokers.map(broker => ({
        ...broker,
        ...calculateBrokerFinancials(broker)
      }));
      await generateBrokersPDF(brokersWithFinancials, selectedLayout);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
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
        <h1 className="text-3xl font-semibold">Advisors</h1>
        <Button
          variant="outline"
          onClick={handleDownloadPDF}
          className="text-lg font-semibold capitalize cursor-pointer bg-[#1F263E] text-white"
        >
          <Download size={16} />
          Entries
        </Button>
      </div>

      <SearchInput
        placeholder="Search advisors by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <BrokersTable
        brokers={paginatedBrokers}
        editingBroker={editingBroker}
        editedData={editedData}
        handleEditChange={handleEditChange}
        handleSave={handleSave}
        handleCancelEdit={handleCancelEdit}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        isAdmin={auth.user?.role === "superadmin"}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
