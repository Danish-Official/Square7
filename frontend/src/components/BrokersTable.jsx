import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BrokerEditModal from "./BrokerEditModal";

export default function BrokersTable({
  brokers,
  editingBroker,
  editedData,
  handleEditChange,
  handleSave,
  handleCancelEdit,
  handleEdit,
  handleDelete,
  isAdmin,
  errors,
}) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sr. No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Commission (%)</TableHead>
            <TableHead>Amount (Rs. )</TableHead>
            <TableHead>TDS (%)</TableHead>
            <TableHead>TDS Amount (Rs. )</TableHead>
            <TableHead>Net Amount (Rs. )</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brokers.map((broker, index) => (
            <TableRow key={broker._id}>
              <TableCell>{index + 1}.</TableCell>
              <TableCell>{broker.name}</TableCell>
              <TableCell>{broker.phoneNumber}</TableCell>
              <TableCell>
                {broker.commission ? `${broker.commission}%` : "-"}
              </TableCell>
              <TableCell>Rs. {broker.amount || 0}</TableCell>
              <TableCell>{broker.tdsPercentage || 5}%</TableCell>
              <TableCell>Rs. {broker.tdsAmount || 0}</TableCell>
              <TableCell>Rs. {broker.netAmount || 0}</TableCell>
              <TableCell>
                {broker.date ? new Date(broker.date).toLocaleDateString() : "-"}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Edit2
                    size={20}
                    className="cursor-pointer mt-0.5"
                    onClick={() => handleEdit(broker)}
                  />
                  {isAdmin && (
                    <Trash2
                      color="#f00505"
                      className="cursor-pointer"
                      onClick={() => handleDelete(broker._id)}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <BrokerEditModal
        isOpen={editingBroker !== null}
        onClose={handleCancelEdit}
        editedData={editedData}
        handleEditChange={handleEditChange}
        handleSave={() => handleSave(editingBroker)}
        errors={errors}
      />
    </>
  );
}