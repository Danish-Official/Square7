import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import PlotLayout1 from "../components/plot-overview/PlotLayout1";
import PlotLayout2 from "../components/plot-overview/PlotLayout2";
import { useLayout } from "@/context/LayoutContext";

const PlotManagement = () => {
  const { selectedLayout } = useLayout();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-4">Layout Management</h1>
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
