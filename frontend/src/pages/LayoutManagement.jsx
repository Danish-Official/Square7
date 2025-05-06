import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import PlotLayout1 from "../components/plot-overview/PlotLayout1";
import PlotLayout2 from "../components/plot-overview/PlotLayout2";
import { useLayout } from "@/context/LayoutContext";
import { apiClient } from "@/lib/utils";
import { pdf } from '@react-pdf/renderer';
import SoldPlotsListPDF from "@/components/SoldPlotsListPDF";
import { toast } from "react-toastify";

const PlotManagement = () => {
  const { selectedLayout } = useLayout();
  const [soldPlots, setSoldPlots] = useState([]);

  useEffect(() => {
    if (selectedLayout) {
      fetchSoldPlots();
    }
  }, [selectedLayout]);

  const fetchSoldPlots = async () => {
    try {
      const { data } = await apiClient.get(`/plots/get-plots/${selectedLayout}`);
      // Get sold plots
      const soldPlotsData = data.filter(plot => plot.status === "sold");
      
      // Fetch invoice data for each sold plot
      const plotsWithPayments = await Promise.all(
        soldPlotsData.map(async (plot) => {
          try {
            const invoiceResponse = await apiClient.get(`/invoices/plot/${plot._id}`);
            const totalPaid = invoiceResponse.data?.payments?.reduce(
              (sum, payment) => sum + payment.amount, 
              0
            ) || 0;
            return { ...plot, totalPaid };
          } catch (error) {
            console.error(`Error fetching invoice for plot ${plot.plotNumber}:`, error);
            return { ...plot, totalPaid: 0 };
          }
        })
      );
      
      setSoldPlots(plotsWithPayments);
    } catch (error) {
      console.error("Error fetching sold plots:", error);
      toast.error("Failed to fetch sold plots");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const layoutName = selectedLayout === "layout1" ? "Square7 Phase 1" : "Square7 Phase 2";
      const blob = await pdf(<SoldPlotsListPDF plots={soldPlots} layoutName={layoutName} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sold_plots_${layoutName}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-semibold">Layout Management</h1>
        {selectedLayout && (
          <Button
            onClick={handleDownloadPDF}
            className="text-lg font-semibold capitalize cursor-pointer bg-gradient-to-b from-[#1F263E] to-[#5266A4] transition-all duration-200 hover:from-[#5266A4] hover:to-[#1F263E]"
          >
            <Download strokeWidth={3} />
            Sold Plots
          </Button>
        )}
      </div>
      <div className="w-fit m-auto my-4">
        <Card className="p-4">
          <CardContent>
            {selectedLayout === "layout1" && <PlotLayout1 />}
            {selectedLayout === "layout2" && <PlotLayout2 />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlotManagement;
