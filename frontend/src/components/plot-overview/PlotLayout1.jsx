import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Add import
import "./PlotLayout1.scss";
import { apiClient } from "@/lib/utils";

const PlotLayout1 = () => {
  const [plots, setPlots] = useState([]);
  const [hoveredPlot, setHoveredPlot] = useState(null); // State for hovered plot
  const [selectedPlot, setSelectedPlot] = useState(null); // State for clicked plot
  const navigate = useNavigate(); // Add navigate

  useEffect(() => {
    fetchPlots();
  }, []);

  async function fetchPlots() {
    try {
      const response = await apiClient.get("/plots/get-plots");
      if (response.status === 304) {
        return; // Do nothing if data is not modified
      }
      const { data } = response;
      if (!data || !Array.isArray(data)) {
        setPlots([]);
      } else {
        setPlots(data);
      }
    } catch (error) {
      setPlots([]); // Ensure plots is set to an empty array on error
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

  const createPlots = (numbers) =>
    numbers.map((num) => {
      const plot = plots.find((p) => p.plotNumber === num);

      return (
        <div
          key={num}
          className={`plots ${getPlotClass(plot?.status)}`}
          onMouseEnter={() => plot && setHoveredPlot(plot)} // Set hovered plot on hover
          onMouseLeave={() => setHoveredPlot(null)} // Clear hovered plot on mouse leave
          onClick={() => plot && setSelectedPlot(plot)} // Set selected plot on click
        >
          {num}
          {plot?.status === "sold" &&
            plot?.buyer &&
            hoveredPlot?.plotNumber === num && ( // Show popup only for the hovered plot
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
            <div className="road rightRoad">
              <div className="roadText">15.00 M WIDE ROAD</div>
              <div className="h-full absolute">
                <div className="road-strips w-1 h-full" />
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

        {/* Color Code Annotations */}
        <div className="legend">
          <div className="legend-item">
            <span className="color-box available"></span> Available
          </div>
          <div className="legend-item">
            <span className="color-box sold"></span> Sold
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
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlotLayout1;
