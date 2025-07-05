import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function BrokerFinancialsModal({ bookingDetails, open, onClose }) {
  // Calculate financials based on the broker data
  const calculateFinancials = () => {
    // Use booking and broker data for calculation
    const commissionRate = bookingDetails?.commissionRate || 0; // now from booking
    const areaSqFt = bookingDetails?.plot?.areaSqFt || 0;
    const amount = commissionRate * areaSqFt;
    const tdsPercentage = bookingDetails?.tdsPercentage || 5; // now from booking
    const tdsAmount = (amount * tdsPercentage) / 100;
    const netAmount = amount - tdsAmount;

    return {
      commissionRate: `Rs. ${commissionRate}`,
      amount: `Rs. ${Math.round(amount)}`,
      tdsPercentage: `${tdsPercentage}%`,
      tdsAmount: `Rs. ${Math.round(tdsAmount)}`,
      netAmount: `Rs. ${Math.round(netAmount)}`
    };
  };

  const financials = calculateFinancials();

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      <DialogOverlay className="fixed inset-0 bg-black/50" />
      <DialogContent className="sm:max-w-[800px] p-6 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] shadow-xl">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Financial Details for {bookingDetails?.broker?.name}
        </h2>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>TDS %</TableHead>
                <TableHead>TDS Amount</TableHead>
                <TableHead>Net Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                  <TableCell>{financials.commissionRate}</TableCell>
                  <TableCell>{financials.amount}</TableCell>
                  <TableCell>{financials.tdsPercentage}</TableCell>
                  <TableCell>{financials.tdsAmount}</TableCell>
                  <TableCell className="font-medium">{financials.netAmount}</TableCell>
                </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
