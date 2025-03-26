import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import PlotLayout from "../components/plot-overview/PlotLayout";

const PlotManagement = () => {

  return (
    <>
      <div className="w-fit m-auto">
        <Card className="p-4">
          <CardContent>
            <h2 className="text-lg font-semibold mb-4">Plot Layout</h2>
              <PlotLayout />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PlotManagement;
