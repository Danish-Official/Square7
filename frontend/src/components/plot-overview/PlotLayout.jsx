import { useEffect, useState } from "react";
import "./PlotLayout.scss";
import { apiClient } from "@/lib/utils";

const PlotLayout = () => {
  const [plots, setPlots] = useState([]);
  const [hoveredPlot, setHoveredPlot] = useState(null); // State for hovered plot
  const [selectedPlot, setSelectedPlot] = useState(null); // State for clicked plot

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
      console.error("Error fetching plots:", error);
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

  return (
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
            <h2>Plot Details</h2>
            <p>
              <strong>Plot Number:</strong> {selectedPlot.plotNumber}
            </p>
            <p>
              <strong>Area (sq ft):</strong> {selectedPlot.areaSqFt}
            </p>
            <p>
              <strong>Status:</strong> {selectedPlot.status}
            </p>
            {selectedPlot.buyer && (
              <>
                <p>
                  <strong>Buyer:</strong> {selectedPlot.buyer}
                </p>
                <p>
                  <strong>Contact:</strong> {selectedPlot.contact}
                </p>
              </>
            )}
            <button onClick={() => setSelectedPlot(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlotLayout;
