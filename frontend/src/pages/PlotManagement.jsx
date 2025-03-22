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
import axios from "axios";

const PlotManagement = () => {
  const [plots, setPlots] = useState(null);
  const [formData, setFormData] = useState({
    plotNumber: "",
    areaSqMt: "",
    areaSqFt: "",
    ratePerSqFt: "",
  });
  const [selectedPlot, setSelectedPlot] = useState(null);

  useEffect(() => {
    fetchPlots();
  }, []);

  async function fetchPlots() {
    try {
      const { data } = await axios.get("/api/plots/get-plots"); // Fix response handling
      setPlots(data);
    } catch (error) {
      console.error("Error fetching plots", error);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/plots/add-plot", formData);
      alert("Plot added successfully");
      fetchPlots();
      setFormData({
        plotNumber: "",
        areaSqMt: "",
        areaSqFt: "",
        ratePerSqFt: "",
      });
    } catch (error) {
      console.error("Error adding plot", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/plots/${id}`);
      alert("Plot deleted successfully");
      fetchPlots();
    } catch (error) {
      console.error("Error deleting plot", error);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const { data } = await axios.get(`/api/plots/${id}`);
      setSelectedPlot(data);
    } catch (error) {
      console.error("Error fetching plot details", error);
    }
  };

  const closeDetails = () => {
    setSelectedPlot(null);
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

        {/* Add Plot Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="plotNumber"
            value={formData.plotNumber}
            onChange={handleChange}
            placeholder="Plot Number"
            required
          />
          <Input
            name="areaSqMt"
            value={formData.areaSqMt}
            onChange={handleChange}
            placeholder="Area (sq mt)"
            required
          />
          <Input
            name="areaSqFt"
            value={formData.areaSqFt}
            onChange={handleChange}
            placeholder="Area (sq ft)"
            required
          />
          <Input
            name="ratePerSqFt"
            value={formData.ratePerSqFt}
            onChange={handleChange}
            placeholder="Rate per sq ft"
            required
          />
          <Button type="submit">Add Plot</Button>
        </form>

        {/* Plot List */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plot Number</TableHead>
              <TableHead>Area (sq mt)</TableHead>
              <TableHead>Area (sq ft)</TableHead>
              <TableHead>Rate per sq ft</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(plots) &&
              plots.length > 0 &&
              plots.map((plot) => (
                <TableRow key={plot._id}>
                  <TableCell>{plot.plotNumber}</TableCell>
                  <TableCell>{plot.areaSqMt}</TableCell>
                  <TableCell>{plot.areaSqFt}</TableCell>
                  <TableCell>{plot.ratePerSqFt}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleViewDetails(plot._id)}
                    >
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(plot._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {selectedPlot && (
          <div className="p-4 border rounded-lg">
            <h2 className="text-2xl">Plot Details</h2>
            <p>
              <strong>Plot Number:</strong> {selectedPlot.plotNumber}
            </p>
            <p>
              <strong>Area (sq mt):</strong> {selectedPlot.areaSqMt}
            </p>
            <p>
              <strong>Area (sq ft):</strong> {selectedPlot.areaSqFt}
            </p>
            <p>
              <strong>Rate per sq ft:</strong> {selectedPlot.ratePerSqFt}
            </p>
            <Button onClick={closeDetails}>Close</Button>
          </div>
        )}
      </div>
    </>
  );
};

export default PlotManagement;
