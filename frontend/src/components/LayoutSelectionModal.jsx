import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import Layout1 from "@/assets/layouts/Layout 1.png";
import Layout2 from "@/assets/layouts/Layout 2.png";
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
      <DialogContent className="sm:max-w-[600px] p-6 bg-[#1F263E] text-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] shadow-xl">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Select Layout</h2>
        <div className="grid grid-cols-2 gap-6">
          <div
            onClick={() => handleLayoutSelect("layout1")}
            className="cursor-pointer p-4 rounded-lg bg-white hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            <img src={Layout1} alt="Layout 1" className="w-full mb-2" />
            <p className="text-center font-medium text-[#1F263E]">Layout 1</p>
          </div>
          <div
            onClick={() => handleLayoutSelect("layout2")}
            className="cursor-pointer p-4 rounded-lg bg-white hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            <img src={Layout2} alt="Layout 2" className="w-full mb-2" />
            <p className="text-center font-medium text-[#1F263E]">Layout 2</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
