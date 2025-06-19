import { pdf } from '@react-pdf/renderer';
import StatementPDF from '@/components/StatementPDF';
import InvoicePDF from '@/components/InvoicePDF';
import ExpensesPDF from '@/components/ExpensesPDF';
import BrokersPDF from '@/components/BrokersPDF';
import React from 'react';

export const generateStatementPDF = async (invoice, selectedLayout) => {
  try {
    const blob = await pdf(
      <StatementPDF data={invoice} selectedLayout={selectedLayout} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Statement_${invoice?._id.slice(-6).toUpperCase()}_${invoice?.booking?.buyerName}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error('Failed to generate PDF');
  }
};

export const generatePaymentReceiptPDF = async (payment, invoice, selectedLayout) => {
  const blob = await pdf(
    <InvoicePDF
      data={{
        payment,
        invoiceNumber: payment?._id.slice(-6).toUpperCase(),
        buyerName: invoice?.booking?.buyerName,
        address: invoice?.booking?.address,
        plotNumber: invoice?.booking?.plot?.plotNumber,
        areaSqFt: invoice?.booking?.plot?.areaSqFt,
      }}
      selectedLayout={selectedLayout}
    />
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Invoice_${payment?._id.slice(-6).toUpperCase()}_${invoice?.booking?.buyerName}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
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
