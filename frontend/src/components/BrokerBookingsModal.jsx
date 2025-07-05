import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiClient } from "@/lib/utils";
import { toast } from "react-toastify";

export default function BrokerBookingsModal({ broker, open, onClose }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && broker?._id) {
      setLoading(true);
      apiClient
        .get(`/bookings/by-broker/${broker._id}`)
        .then(({ data }) => setBookings(data))
        .catch(() => {
          toast.error("Failed to fetch bookings for this advisor");
          setBookings([]);
        })
        .finally(() => setLoading(false));
    }
  }, [open, broker]);

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogOverlay className="fixed inset-0 bg-black/50" />
      <DialogContent className="sm:max-w-[800px] p-6 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] shadow-xl">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Bookings for {broker?.name}
        </h2>
        {loading ? (
          <div>Loading...</div>
        ) : bookings.length === 0 ? (
          <div>No bookings found for this advisor.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plot No.</TableHead>
                <TableHead>Booking Date</TableHead>
                <TableHead>Area (Sq ft)</TableHead>
                <TableHead>Commission rate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>TDS %</TableHead>
                <TableHead>TDS Amount</TableHead>
                <TableHead>Net Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
                // Use booking.broker if available, else fallback to modal broker
                const brokerForCalc = booking.broker || broker;
                const commissionRate = booking.broker?.commissionRate || 0;
                const areaSqFt = booking.plot?.areaSqFt || 0;
                const amount = commissionRate * areaSqFt;
                const tdsPercentage = brokerForCalc.tdsPercentage || 5;
                const tdsAmount = (amount * tdsPercentage) / 100;
                const netAmount = amount - tdsAmount;
                return (
                  <TableRow key={booking._id}>
                    <TableCell>{booking.plot?.plotNumber}</TableCell>
                    <TableCell>{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                    <TableCell>{areaSqFt}</TableCell>
                    <TableCell>Rs. {commissionRate}</TableCell>
                    <TableCell>Rs. {amount}</TableCell>
                    <TableCell>{tdsPercentage}%</TableCell>
                    <TableCell>{tdsAmount ? `Rs. ${Math.round(tdsAmount)}` : '-'}</TableCell>
                    <TableCell>Rs. {Math.round(netAmount)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        <button className="mt-4 px-4 py-2 bg-gray-700 text-white rounded" onClick={onClose}>
          Close
        </button>
      </DialogContent>
    </Dialog>
  );
}
