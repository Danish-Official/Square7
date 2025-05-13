import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '@/components/InvoicePDF';
import SinglePaymentPDF from '@/components/SinglePaymentPDF';
import React from 'react';

export const generateInvoicePDF = async (invoice, filename, selectedLayout) => {
  try {
    const blob = await pdf(React.createElement(InvoicePDF, { data: invoice, selectedLayout })).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `invoice-${invoice.invoiceNumber || 'download'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const generatePaymentReceiptPDF = async (payment, invoice, filename, selectedLayout) => {
  try {
    const blob = await pdf(React.createElement(SinglePaymentPDF, {
      data: {
        payment,
        buyerName: invoice?.booking?.buyerName,
        plotNumber: invoice?.booking?.plot?.plotNumber
      },
      selectedLayout
    })).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `payment-receipt-${payment.id || 'download'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error('Failed to generate PDF');
  }
};
