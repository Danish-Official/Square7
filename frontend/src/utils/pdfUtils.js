import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '@/components/InvoicePDF';

export const generatePDF = async (invoice) => {
  const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Invoice_${invoice?.booking?.buyerName}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};
