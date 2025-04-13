import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import PlotLayout1 from "../components/plot-overview/PlotLayout1";
import PlotLayout2 from "../components/plot-overview/PlotLayout2";
import { useLayout } from "@/context/LayoutContext";

const PlotManagement = () => {
  const { selectedLayout } = useLayout();

  return (
    <div className="w-fit m-auto my-4">
      <Card className="p-4">
        <CardContent>
          <h2 className="text-lg font-semibold mb-4">Plot Layout</h2>
          {selectedLayout === "layout1" && <PlotLayout1 />}
          {selectedLayout === "layout2" && <PlotLayout2 />}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlotManagement;
