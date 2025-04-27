import React, { useEffect, useState } from "react";
import "./PlotLayout2.scss";
import { apiClient } from "@/lib/utils";
import { useLayout } from "@/context/LayoutContext";
import { useNavigate } from "react-router-dom";

const PlotLayout2 = () => {
  const { selectedLayout } = useLayout();
  const navigate = useNavigate();
  const [plots, setPlots] = useState([]);
  const [hoveredPlot, setHoveredPlot] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);

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

  const createPlot = (num) => {
    const plot = plots.find((p) => p.plotNumber === num);
    const plotClass = plot ? getPlotClass(plot.status) : "available";

    return (
      <div
        key={num}
        className={`plot plot${num} ${plotClass}`}
        onMouseEnter={() => plot && setHoveredPlot(plot)}
        onMouseLeave={() => setHoveredPlot(null)}
        onClick={() => plot && setSelectedPlot(plot)}
      >
        {num}
        {plot?.status === "sold" && plot?.buyer && hoveredPlot?.plotNumber === num && (
          <div className="popup-hover">
            <strong>Buyer:</strong> {plot.buyer}
            <br />
            <strong>Contact:</strong> {plot.contact}
          </div>
        )}
      </div>
    );
  };

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
                  {createPlot(23)}
                  {createPlot(24)}
                  {createPlot(25)}
                  {createPlot(26)}
                  {createPlot(27)}
                </div>
                <div className="plot13to22">
                  {createPlot(13)}
                  {createPlot(14)}
                  {createPlot(15)}
                  {createPlot(16)}
                  {createPlot(17)}
                  {createPlot(18)}
                  {createPlot(19)}
                  {createPlot(20)}
                  {createPlot(21)}
                  {createPlot(22)}
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
                  {createPlot(3)}
                  {createPlot(4)}
                  {createPlot(5)}
                  {createPlot(6)}
                  {createPlot(7)}
                  {createPlot(8)}
                  {createPlot(9)}
                  {createPlot(10)}
                  {createPlot(11)}
                  {createPlot(12)}
                </div>
                <div className="plot1-2-amenitySpace">
                  <div className="plot1-2">
                    {createPlot(2)}
                    {createPlot(1)}
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
                  {createPlot(28)}
                  {createPlot(29)}
                  {createPlot(30)}
                  {createPlot(31)}
                </div>
                <div className="plot32to40">
                  {createPlot(32)}
                  {createPlot(33)}
                  {createPlot(34)}
                  {createPlot(35)}
                  {createPlot(36)}
                  {createPlot(37)}
                  {createPlot(38)}
                  {createPlot(39)}
                  {createPlot(40)}
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
                  {createPlot(41)}
                  {createPlot(42)}
                  {createPlot(43)}
                  {createPlot(44)}
                  {createPlot(45)}
                  {createPlot(46)}
                  {createPlot(47)}
                  {createPlot(48)}
                </div>
                <div className="plot49to56">
                  {createPlot(49)}
                  {createPlot(50)}
                  {createPlot(51)}
                  {createPlot(52)}
                  {createPlot(53)}
                  {createPlot(54)}
                  {createPlot(55)}
                  {createPlot(56)}
                </div>
              </div>
              <div className="verticalRoads road">
                <div className="roadTextVertical">09.00 M WIDE ROAD</div>
                <div className="h-full absolute">
                  <div className="road-strips-vertical w-1 h-full" />
                </div>
              </div>
              <div className="openSpace">Open Space</div>
            </div>
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
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlotLayout2;
