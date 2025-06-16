import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BrokerEditModal({
  isOpen,
  onClose,
  editedData,
  handleEditChange,
  handleSave,
  errors,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Advisor</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name">Name</label>
            <Input
              id="name"
              value={editedData.name || ""}
              onChange={(e) => handleEditChange("name", e.target.value)}
              className={errors?.name ? "border-red-500" : ""}
            />
            {errors?.name && (
              <span className="text-red-500 text-sm">{errors.name}</span>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="phoneNumber">Phone Number</label>
            <Input
              id="phoneNumber"
              value={editedData.phoneNumber || ""}
              onChange={(e) => handleEditChange("phoneNumber", e.target.value)}
              className={errors?.phoneNumber ? "border-red-500" : ""}
            />
            {errors?.phoneNumber && (
              <span className="text-red-500 text-sm">{errors.phoneNumber}</span>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="commission">Commission (%)</label>
            <Input
              id="commission"
              type="number"
              value={editedData.commission || ""}
              onChange={(e) => handleEditChange("commission", Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tdsPercentage">TDS (%)</label>
            <Input
              id="tdsPercentage"
              type="number"
              value={editedData.tdsPercentage || ""}
              onChange={(e) => handleEditChange("tdsPercentage", Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="date">Date</label>
            <Input
              id="date"
              type="date"
              value={editedData.date ? new Date(editedData.date).toISOString().split("T")[0] : ""}
              onChange={(e) => handleEditChange("date", e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
