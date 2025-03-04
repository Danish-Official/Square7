// import React, { useState } from "react";
import "./PlotLayout.scss";
import { plotData } from "./plotdata";

const PlotLayout = () => {
  // const [selectedPlot, setSelectedPlot] = useState(null);

  // const handlePlotClick = (plotId) => {
  //   setSelectedPlot(
  //     selectedPlot?.id === plotId ? null : { id: plotId, ...plotData[plotId] }
  //   );
  // };

  const getPlotClass = (status) => {
    switch (status) {
      case "sold":
        return "sold";
      case "booked":
        return "booked";
      default:
        return "available";
    }
  };

  const createPlots = (numbers) =>
    numbers.map((num) => (
      <div key={num} className={`plots ${getPlotClass(plotData[num]?.status)}`}>
        {num}
        {plotData[num]?.buyer && (
          <div className="popup">
            <strong>{plotData[num].buyer}</strong>
            <br />
            {plotData[num].contact}
          </div>
        )}
      </div>
    ));

  return (
    <div className="plotLayout flex">
      <div className="layout-wrapper">
        <div className="upperLayout">
          <div className="leftPlots">
            {createPlots([25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35])}
          </div>
          <div className="road leftRoad">
            <div className="roadText">09.00 M WIDE ROAD</div>
          </div>
          <div className="middleSection">
            <div className="openSpace">Open Space</div>
            <div className="middlePlots">
              {createPlots([24, 13, 23, 14, 22, 15, 21, 16, 20, 17, 19, 18])}
            </div>
          </div>
          <div className="road middleRoad">
            <div className="roadText">09.00 M WIDE ROAD</div>
          </div>
          <div className="rightPlots">
            {createPlots([9, 8, 10, 7, 11, 6, 12, 5])}
            <div className="plots amenity">Amenity Space</div>
            {createPlots([4, 3, 2, 1])}
          </div>
          <div className="road rightRoad">
            <div className="roadText">15.00 M WIDE ROAD</div>
          </div>
        </div>
        <div className="lowerLayout">
          <div className="road bottomRoad">
            <div className="roadText">12.00 M WIDE ROAD</div>
          </div>
          <div className="bottomWrapper">
            <div className="bottomPlots">
              {createPlots([
                48, 47, 46, 45, 44, 43, 42, 41, 40, 39, 38, 37, 36,
              ])}
            </div>
            <div className="roadExtension"></div>
          </div>
        </div>
      </div>

      {/* Color Code Annotations */}
      <div className="legend">
        <div className="legend-item">
          <span className="color-box available"></span> Available
        </div>
        <div className="legend-item">
          <span className="color-box booked"></span> Booked
        </div>
        <div className="legend-item">
          <span className="color-box sold"></span> Sold
        </div>
      </div>
    </div>
  );
};

export default PlotLayout;
