import PlotLayout from "./PlotLayout";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function LayoutMap() {
   return (
    <div className="flex">
      <TransformWrapper>
        <TransformComponent>
          <PlotLayout />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
