import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import LayoutMap from "./plot-overview/LayoutMap";

const PlotManagement = () => {
  return (
    <div>
      <Card className="p-4">
        <CardContent>
          <h2 className="text-lg font-semibold mb-4">Plot Layout</h2>
          <LayoutMap />
        </CardContent>
      </Card>
    </div>
  );
};

export default PlotManagement;
