import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import LayoutMap from "./plot-overview/LayoutMap";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
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
import { Trash2 } from "lucide-react";

const PlotManagement = () => {
  const [plots, setPlots] = useState([]);
  const [editingPlotId, setEditingPlotId] = useState(null);
  const [formData, setFormData] = useState({
    plotNumber: "",
    areaSqMt: "",
    areaSqFt: "",
    ratePerSqFt: "",
  });
  const [errors, setErrors] = useState({});
  // Removed unused isFormValid state

  useEffect(() => {
    fetchPlots();
  }, []);

  useEffect(() => {
    // Check if the form is valid
    const hasErrors = Object.values(errors).some((error) => error !== "");
    !hasErrors &&
    formData.plotNumber &&
    formData.areaSqMt &&
    formData.areaSqFt &&
    formData.ratePerSqFt; // Removed unused isFormValid assignment
  }, [errors, formData]);

  async function fetchPlots() {
    try {
      const { data } = await apiClient.get("/plots/get-plots");
      setPlots(data || []);
    } catch (error) {
      console.error("Error fetching plots", error);
    }
  }

  const validateField = (name, value) => {
    let error = "";
    if (name === "plotNumber") {
      if (!value) {
        error = "Plot number is required.";
      } else if (plots.some((plot) => plot.plotNumber === value)) {
        error = "Plot number already exists.";
      }
    } else if (
      name === "areaSqMt" ||
      name === "areaSqFt" ||
      name === "ratePerSqFt"
    ) {
      if (!value || isNaN(value) || value <= 0) {
        error = `${name} must be a positive number.`;
      }
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e, id) => {
    const { name, value } = e.target;
    if (id) {
      setPlots((prev) =>
        prev.map((plot) =>
          plot._id === id ? { ...plot, [name]: value } : plot
        )
      );
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      validateField(name, value);
    }
  };

  const handleSave = async (id) => {
    const plotToUpdate = plots.find((plot) => plot._id === id);
    const hasErrors = Object.keys(plotToUpdate).some((key) =>
      validateField(key, plotToUpdate[key])
    );
    if (hasErrors) return;

    try {
      await apiClient.put(`/plots/${id}`, plotToUpdate);
      alert("Plot updated successfully");
      setEditingPlotId(null);
      fetchPlots();
    } catch (error) {
      console.error("Error updating plot", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/plots/${id}`);
      alert("Plot deleted successfully");
      fetchPlots();
    } catch (error) {
      console.error("Error deleting plot", error);
    }
  };

  const handleEdit = (id) => {
    setEditingPlotId(id);
  };

  const handleAddPlot = () => {
    const newPlot = {
      _id: `new-${Date.now()}`, // Temporary ID for the new plot
      plotNumber: "",
      areaSqMt: "",
      areaSqFt: "",
      ratePerSqFt: "",
      status: "available",
    };
    setPlots((prev) => [...prev, newPlot]);
    setEditingPlotId(newPlot._id);
  };

  return (
    <>
      <div>
        <Card className="p-4">
          <CardContent>
            <h2 className="text-lg font-semibold mb-4">Plot Layout</h2>
            <LayoutMap />
          </CardContent>
        </Card>
      </div>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-semibold">Plot Management</h1>

        {/* Plot List */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plot Number</TableHead>
              <TableHead>Area (sq mt)</TableHead>
              <TableHead>Area (sq ft)</TableHead>
              <TableHead>Rate per sq ft</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(plots) &&
              plots.map((plot) => (
                <TableRow key={plot._id}>
                  <TableCell>
                    <Input
                      name="plotNumber"
                      value={plot.plotNumber}
                      onChange={(e) => handleChange(e, plot._id)}
                      disabled={editingPlotId !== plot._id} // Allow editing only when in edit mode
                    />
                    {editingPlotId === plot._id && errors.plotNumber && (
                      <p className="text-red-500">{errors.plotNumber}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      name="areaSqMt"
                      value={plot.areaSqMt}
                      onChange={(e) => handleChange(e, plot._id)}
                      disabled={editingPlotId !== plot._id}
                    />
                    {editingPlotId === plot._id && errors.areaSqMt && (
                      <p className="text-red-500">{errors.areaSqMt}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      name="areaSqFt"
                      value={plot.areaSqFt}
                      onChange={(e) => handleChange(e, plot._id)}
                      disabled={editingPlotId !== plot._id}
                    />
                    {editingPlotId === plot._id && errors.areaSqFt && (
                      <p className="text-red-500">{errors.areaSqFt}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      name="ratePerSqFt"
                      value={plot.ratePerSqFt}
                      onChange={(e) => handleChange(e, plot._id)}
                      disabled={editingPlotId !== plot._id}
                    />
                    {editingPlotId === plot._id && errors.ratePerSqFt && (
                      <p className="text-red-500">{errors.ratePerSqFt}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      name="status"
                      value={plot.status}
                      onChange={(e) => handleChange(e, plot._id)}
                      disabled={editingPlotId !== plot._id}
                    />
                  </TableCell>
                  <TableCell className="flex gap-2">
                    {editingPlotId === plot._id ? (
                      <Button
                        variant="outline"
                        onClick={() => handleSave(plot._id)}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleEdit(plot._id)}
                      >
                        Edit
                      </Button>
                    )}
                    <Trash2
                      color="#f00505"
                      className="self-center"
                      onClick={() => handleDelete(plot._id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <Button className="mt-4" onClick={handleAddPlot}>
          Add Plot
        </Button>
      </div>
    </>
  );
};

export default PlotManagement;
