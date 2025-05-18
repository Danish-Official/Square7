import { pdf } from '@react-pdf/renderer';
import StatementPDF from '@/components/StatementPDF';
import InvoicePDF from '@/components/StatementPDF';
import ExpensesPDF from '@/components/ExpensesPDF';
import BrokersPDF from '@/components/BrokersPDF';
import React from 'react';

export const generateStatementPDF = async (invoice, filename, selectedLayout) => {
  try {
    const blob = await pdf(React.createElement(StatementPDF, { data: invoice, selectedLayout })).toBlob();
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
    const blob = await pdf(React.createElement(InvoicePDF, {
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

export const generateExpensesPDF = async (expenses, filename, selectedLayout) => {
  try {
    const blob = await pdf(React.createElement(ExpensesPDF, { expenses, selectedLayout })).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `expenses-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const generateBrokersPDF = async (brokers, selectedLayout) => {
  try {
    const blob = await pdf(React.createElement(BrokersPDF, { brokers, selectedLayout })).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Brokers_List_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
