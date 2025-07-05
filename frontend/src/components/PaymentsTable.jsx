import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Edit2, Trash2, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function PaymentsTable({ 
  payments, 
  onEditPayment, 
  onDeletePayment, 
  onDownloadReceipt,
  className = "" 
}) {
  const { auth } = useAuth();

  if (!payments?.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        No payments recorded yet.
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount).replace(/^(\D+)/, 'Rs. ');
  };

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          <TableHead>Sr No.</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Payment Type</TableHead>
          <TableHead>Narration</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment, index) => (
          <TableRow key={index}>
            <TableCell>{index + 1}.</TableCell>
            <TableCell>{formatCurrency(payment.amount)}</TableCell>
            <TableCell>{payment.paymentType}</TableCell>
            <TableCell>{payment.narration || '-'}</TableCell>
            <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditPayment && onEditPayment(index)}
                  className="h-8 px-2 lg:px-3"
                >
                  <Edit2 size={16} color="#000" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownloadReceipt && onDownloadReceipt(payment)}
                  className="h-8 px-2 lg:px-3"
                >
                  <Download size={16} color="#000" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 lg:px-3"
                >
                  <Send size={16} color="#000" />
                </Button>
                {auth.user?.role === "superadmin" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeletePayment && onDeletePayment(index)}
                    className="h-8 px-2 lg:px-3 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} color="#f00505" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
