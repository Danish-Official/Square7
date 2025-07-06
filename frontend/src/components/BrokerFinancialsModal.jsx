import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0">
        <Card className="border-none shadow-none bg-white">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="text-2xl font-semibold text-[#1F263E] text-center">Financial Details for {bookingDetails?.broker?.name}</DialogTitle>
          </DialogHeader>
          <CardContent className="pt-2 pb-0">
            <div className="border rounded-md bg-white">
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
              <Button onClick={onClose} className="px-4 py-2 rounded bg-[#1F263E] text-white hover:bg-[#232b47]">Close</Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
