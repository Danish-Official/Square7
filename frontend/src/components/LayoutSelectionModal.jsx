import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { useLayout } from "@/context/LayoutContext";

export default function LayoutSelectionModal({ open, onClose }) {
  const { setSelectedLayout } = useLayout();

  const handleLayoutSelect = (layout) => {
    setSelectedLayout(layout);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogOverlay className="fixed inset-0 bg-black/50" />
      <DialogContent className="sm:max-w-[650px] p-6 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] shadow-xl">
        <h2 className="text-2xl font-semibold mb-4 text-center">Select Layout</h2>
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => handleLayoutSelect("layout1")}
            className="cursor-pointer rounded-lg bg-gray-900 hover:bg-gray-900 transition-all transform hover:scale-105"
          >
            {/* <img src={Layout1} alt="Layout 1" className="w-full mb-2" /> */}
            <div className="flex flex-col items-center justify-center font-bold p-6 text-amber-400">
              <p className="text-5xl">KRISHNAM</p>
              <p className="ms-10 p-1.5 text-2xl">NAGAR 1</p>
            </div>
          </div>
          <div
            onClick={() => handleLayoutSelect("layout2")}
            className="cursor-pointer rounded-lg bg-gray-900 hover:bg-gray-900 transition-all transform hover:scale-105"
          >
            <div className="flex flex-col items-center justify-center font-bold p-6 text-amber-400">
              <p className="text-5xl">KRISHNAM</p>
              <p className="ms-10 p-1.5 text-2xl">NAGAR 2</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
