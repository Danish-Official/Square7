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
import BrokerBookingsModal from "./BrokerBookingsModal";
import { useState } from "react";

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
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleBrokerNameClick = (broker) => {
    setSelectedBroker(broker);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBroker(null);
  };

  // Defensive: filter out null/undefined brokers
  const safeBrokers = (brokers || []).filter(b => b && typeof b === 'object');
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeBrokers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">No advisors found.</TableCell>
            </TableRow>
          ) : safeBrokers.map((broker, index) => (
            <TableRow key={broker._id || index}>
              <TableCell>
                <span
                  className="text-blue-600 cursor-pointer hover:underline"
                  onClick={() => handleBrokerNameClick(broker)}
                >
                  {broker.name || '-'}
                </span>
              </TableCell>
              <TableCell>{broker.phoneNumber || '-'}</TableCell>
              <TableCell>{broker.address || '-'}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="cursor-pointer h-8 px-2 lg:px-3" onClick={() => handleEdit(broker)}>
                    <Edit2
                      size={16}
                      className=""
                    />
                  </Button>
                  {isAdmin && (
                    <Button variant="ghost" size="sm" className="cursor-pointer h-8 px-2 lg:px-3" onClick={() => handleDelete(broker._id)}>
                      <Trash2
                        color="#f00505"
                        onClick={() => handleDelete(broker._id)}
                        size={16}
                      />
                    </Button>
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

      <BrokerBookingsModal
        broker={selectedBroker}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}