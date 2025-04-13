import jsPDF from "jspdf";

export const setupPDF = () => {
  const doc = new jsPDF();
  doc.setFont("helvetica");
  return doc;
};

export const addHeader = (doc, title) => {
  doc.setFontSize(20);
  doc.setTextColor(31, 38, 62); // #1F263E
  doc.text(title, 20, 20);
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.line(20, 25, 190, 25);
};

export const addField = (doc, label, value, y) => {
  doc.setFontSize(11);
  doc.setTextColor(90, 90, 90);
  doc.text(label, 20, y);
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text(value ? value.toString() : "", 80, y);
};

export const addDivider = (doc, y) => {
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, 190, y);
};
