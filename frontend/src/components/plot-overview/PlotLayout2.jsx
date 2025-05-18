import React, { useEffect, useState } from "react";
import "./PlotLayout2.scss";
import { apiClient } from "@/lib/utils";
import { useLayout } from "@/context/LayoutContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import InvoiceDetailsModal from "@/components/InvoiceDetailsModal";

const PlotLayout2 = () => {
  const { selectedLayout } = useLayout();
  const navigate = useNavigate();
  const [plots, setPlots] = useState([]);
  const [hoveredPlot, setHoveredPlot] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedLayout) {
      fetchPlots();
    }
  }, [selectedLayout]);

  async function fetchPlots() {
    try {
      const response = await apiClient.get(`/plots/get-plots/${selectedLayout}`);
      if (response.status === 304) return;
      const { data } = response;
      if (!data || !Array.isArray(data)) {
        setPlots([]);
      } else {
        setPlots(data);
      }
    } catch (error) {
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

  const handlePlotClick = async (plot) => {
    if (plot.status === "sold") {
      try {
        console.log("Fetching invoice for plot:", plot._id);
        const { data } = await apiClient.get(`/invoices/plot/${plot._id}`);
        console.log("Invoice response:", data);
        
        if (data && data.booking) {
          setSelectedInvoice(data);
          setIsDialogOpen(true);
        } else {
          console.error("Invalid invoice data:", data);
          toast.error("No invoice details found for this plot");
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
          className={`plot plot${num} ${getPlotClass(plot?.status)}`}
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

  const handleBooking = (plot) => {
    navigate("/new-booking", {
      state: { selectedPlotId: plot._id }
    });
  };

  return (
    <div className="plotLayout2Wrapper">
      <div className="flex gap-0.5">
        <div className="highway verticalRoads road">
          <div className="roadTextVertical">45.00 M WIDE ROAD</div>
          <div className="h-full absolute">
            <div className="road-strips-vertical w-1 h-full" />
          </div>
        </div>
        <div className="actualLayout">
          <div className="upperLayout">
            <div className="horizontalRoads road max-w-[80%] above12m">
              <div className="roadTextHorizontal">12.00 M WIDE ROAD</div>
              <div className="w-full absolute">
                <div className="road-strips-horizontal w-full h-1" />
              </div>
            </div>
            <div className="belowRoadSection">
              <div className="verticalRoads road">
                <div className="roadTextVertical">09.00 M WIDE ROAD</div>
                <div className="h-full absolute">
                  <div className="road-strips-vertical w-1 h-full" />
                </div>
              </div>
              <div className="leftPlots">
                <div className="plot23to27">
                  {createPlots([23, 24, 25, 26, 27])}
                </div>
                <div className="plot13to22">
                  {createPlots([13, 14, 15, 16, 17, 18, 19, 20, 21, 22])}
                </div>
              </div>
              <div className="verticalRoads road">
                <div className="roadTextVertical">09.00 M WIDE ROAD</div>
                <div className="h-full absolute">
                  <div className="road-strips-vertical w-1 h-full" />
                </div>
              </div>
              <div className="rightPlots">
                <div className="plot3to12">
                  {createPlots([3, 4, 5, 6, 7, 8, 9, 10, 11, 12])}
                </div>
                <div className="plot1-2-amenitySpace">
                  <div className="plot1-2">
                    {createPlots([2, 1])}
                  </div>
                  <div className="amenitySpace">Amenity Space</div>
                </div>
              </div>
            </div>
          </div>
          <div className="lowerLayout">
            <div className="horizontalRoads road below12m">
              <div className="roadTextHorizontal">12.00 M WIDE ROAD</div>
              <div className="w-full absolute">
                <div className="road-strips-horizontal w-full h-1" />
              </div>
            </div>
            <div className="belowRoadSection">
              <div className="verticalRoads road">
                <div className="roadTextVertical">09.00 M WIDE ROAD</div>
                <div className="h-full absolute">
                  <div className="road-strips-vertical w-1 h-full" />
                </div>
              </div>
              <div className="leftPlots">
                <div className="plot28to31">
                  {createPlots([28, 29, 30, 31])}
                </div>
                <div className="plot32to40">
                  {createPlots([32, 33, 34, 35, 36, 37, 38, 39, 40])}
                </div>
              </div>
              <div className="verticalRoads road">
                <div className="roadTextVertical">09.00 M WIDE ROAD</div>
                <div className="h-full absolute">
                  <div className="road-strips-vertical w-1 h-full" />
                </div>
              </div>
              <div className="rightPlots">
                <div className="plot41to48">
                  {createPlots([41, 42, 43, 44, 45, 46, 47, 48])}
                </div>
                <div className="plot49to56">
                  {createPlots([49, 50, 51, 52, 53, 54, 55, 56])}
                </div>
              </div>
              <div className="verticalRoads road">
                <div className="roadTextVertical">09.00 M WIDE ROAD</div>
                <div className="h-full absolute">
                  <div className="road-strips-vertical w-1 h-full" />
                </div>
              </div>
              <div className="openSpace text-left">Open Space</div>
            </div>
            <div className="h-2 bottomBorder" />
          </div>
        </div>
        <div className="w-[10px] h-[875px] rigthBorder" />
      </div>

      <div className="legend">
        <div className="legend-item">
          <span className="color-box available"></span> Available
        </div>
        <div className="legend-item">
          <span className="color-box sold"></span> Sold
        </div>
      </div>

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
  );
};

export default PlotLayout2;
