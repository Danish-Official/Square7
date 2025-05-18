import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PlotLayout1.scss";
import { apiClient } from "@/lib/utils";
import { toast } from "react-toastify";
import { useLayout } from "@/context/LayoutContext";
import InvoiceDetailsModal from "@/components/InvoiceDetailsModal";

const PlotLayout1 = () => {
  const [plots, setPlots] = useState([]);
  const [hoveredPlot, setHoveredPlot] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { selectedLayout } = useLayout();

  useEffect(() => {
    if (selectedLayout) {
      fetchPlots();
    }
  }, [selectedLayout]);

  async function fetchPlots() {
    try {
      const response = await apiClient.get(`/plots/get-plots/${selectedLayout}`);
      if (response.status === 304) {
        return;
      }
      const { data } = response;
      if (!data || !Array.isArray(data)) {
        setPlots([]);
        toast.error("No plots found");
      } else {
        setPlots(data);
      }
    } catch (error) {
      console.error("Error fetching plots:", error);
      toast.error("Failed to fetch plots");
      setPlots([]);
    }
  }

  const getPlotClass = (status) => {
    switch (status) {
      case "sold":
        return "sold";
      default:
        return "available";
    }
  };

  const handleBooking = (plot) => {
    navigate("/new-booking", {
      state: { selectedPlotId: plot._id }
    });
  };

  const handlePlotClick = async (plot) => {
    if (plot.status === "sold") {
      try {
        console.log("Fetching invoice for plot:", plot._id);
        const { data } = await apiClient.get(`/invoices/plot/${plot._id}`);
        console.log("Invoice data:", data); 
        if (data && data.booking) {
          setSelectedInvoice(data);
          setIsDialogOpen(true);
        } else {
          toast.error("No invoice found for this plot");
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
        const errorMessage = error.response?.data?.message || "Failed to fetch invoice details";
        toast.error(errorMessage);
      }
    } else {
      setSelectedPlot(plot);
    }
  };

  const createPlots = (numbers) =>
    numbers.map((num) => {
      const plot = plots.find((p) => p.plotNumber === num);

      return (
        <div
          key={num}
          className={`plots ${getPlotClass(plot?.status)}`}
          onMouseEnter={() => plot && setHoveredPlot(plot)}
          onMouseLeave={() => setHoveredPlot(null)}
          onClick={() => plot && handlePlotClick(plot)}
        >
          {num}
          {plot?.status === "sold" &&
            plot?.buyer &&
            hoveredPlot?.plotNumber === num && (
              <div className="popup-hover">
                <strong>Buyer:</strong> {plot.buyer}
                <br />
                <strong>Contact:</strong> {plot.contact}
              </div>
            )}
        </div>
      );
    });

  return (
    <div className="plotLayout1Wrapper">
      <div className="plotLayout">
        <div className="layout-wrapper">
          <div className="upperLayout">
            <div className="leftPlots">
              {Array.isArray(plots) &&
                plots.length > 0 &&
                createPlots([25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35])}
            </div>
            <div className="road leftRoad">
              <div className="roadText">09.00 M WIDE ROAD</div>
              <div className="h-full absolute">
                <div className="road-strips w-1 h-full" />
              </div>
            </div>
            <div className="middleSection">
              <div className="openSpace">Open Space</div>
              <div className="middlePlots">
                {Array.isArray(plots) &&
                  plots.length > 0 &&
                  createPlots([24, 13, 23, 14, 22, 15, 21, 16, 20, 17, 19, 18])}
              </div>
            </div>
            <div className="road middleRoad">
              <div className="roadText">09.00 M WIDE ROAD</div>
              <div className="h-full absolute">
                <div className="road-strips w-1 h-full" />
              </div>
            </div>
            <div className="rightPlots">
              {Array.isArray(plots) &&
                plots.length > 0 &&
                createPlots([9, 8, 10, 7, 11, 6, 12, 5])}
              <div className="plots amenity">Amenity Space</div>
              {createPlots([4, 3, 2, 1])}
            </div>
            <div className="relative">
              <div className="road rightRoad absolute h-[142%]">
                <div className="roadText">15.00 M WIDE ROAD</div>
                <div className="h-full absolute">
                  <div className="road-strips w-1 h-full" />
                </div>
              </div>
            </div>
          </div>
          <div className="lowerLayout">
            <div className="road bottomRoad">
              <div className="roadText">12.00 M WIDE ROAD</div>
              <div className="w-full absolute">
                <div className="road-strips-bottom w-full h-1" />
              </div>
            </div>
            <div className="bottomPlots">
              {plots.length > 0 &&
                createPlots([48, 47, 46, 45, 44, 43, 42, 41, 40, 39, 38, 37, 36])}
            </div>
          </div>
        </div>

        {/* Plot Details Modal */}
        {selectedPlot && (
          <div className="plot-details-modal">
            <div className="modal-content">
              <h2 className="text-xl font-semibold mb-4">Plot Details</h2>
              <div className="space-y-3 mb-6">
                <p className="grid grid-cols-2 gap-2">
                  <strong>Plot Number:</strong> {selectedPlot.plotNumber}
                </p>
                <p className="grid grid-cols-2 gap-2">
                  <strong>Area (sq ft):</strong> {selectedPlot.areaSqFt}
                </p>
                <p className="grid grid-cols-2 gap-2">
                  <strong>Status:</strong> {selectedPlot.status}
                </p>
                {selectedPlot.buyer && (
                  <>
                    <p className="grid grid-cols-2 gap-2">
                      <strong>Buyer:</strong> {selectedPlot.buyer}
                    </p>
                    <p className="grid grid-cols-2 gap-2">
                      <strong>Contact:</strong> {selectedPlot.contact}
                    </p>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-3">
                {selectedPlot.status !== "sold" && (
                  <button
                    onClick={() => handleBooking(selectedPlot)}
                    className="bg-[#1F263E] text-white px-4 py-2 rounded-md hover:bg-[#2A324D]"
                  >
                    Book Plot
                  </button>
                )}
                <button
                  onClick={() => setSelectedPlot(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-[#f7f7f7]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        <InvoiceDetailsModal 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          invoice={selectedInvoice}
          onInvoiceUpdated={() => fetchPlots()}
        />
      </div>
    </div>
  );
};

export default PlotLayout1;
