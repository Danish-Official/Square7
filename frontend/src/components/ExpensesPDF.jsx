import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import Layout1 from "@/assets/layouts/layoutblue1.png";
import Layout2 from "@/assets/layouts/layoutblue2.png";
import bgBuilding from "@/assets/bg-building.png";
import logoPath from "@/assets/logo.png";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderBottom: '2 solid #1F263E',
    paddingBottom: 10,
  },
  logo: {
    width: 70,
    height: 70,
  },
  backgroundBuilding: {
    position: 'absolute',
    bottom: 0,
    left: '-15%',
    right: 0,
    width: '130%',
    height: '200',
    opacity: 0.3,
    zIndex: -1,
  },
  backgroundLogo: {
    position: 'absolute',
    left: '20%',
    top: '20%',
    width: 400,
    height: 400,
    opacity: 0.05,
    zIndex: -1,
  },
  layoutLogo: {
    width: 140,
    height: 70,
  },
  address: {
    fontSize: 10,
    textAlign: 'right',
    width: '30%',
    color: '#666666',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1F263E',
    textAlign: 'center',
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    paddingVertical: 4,
  },
  tableHeader: {
    backgroundColor: '#1F263E',
  },
  tableCell: {
    fontSize: 9,
    color: '#2d3748',
    padding: 4,
  },
  nameCell: { width: '14%' }, // Adjusted width
  contactCell: { width: '13%' }, // New column for contact no.
  receivedByCell: { width: '14%' },
  amountCell: { width: '12%' },
  tdsCell: { width: '8%' },
  netAmountCell: { width: '16%' },
  dateCell: { width: '15%' },
  headerCell: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 10,
    borderRadius: 4,
    gap: 20,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F263E',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F263E',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'right',
    color: '#666666',
    fontSize: 10,
    borderTop: '1 solid #dee2e6',
    textTransform: 'uppercase',
    paddingTop: 5,
  }
});

const ExpensesPDF = ({ expenses, selectedLayout }) => {
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalNetAmount = expenses.reduce((sum, exp) => sum + exp.netAmount, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={bgBuilding} style={styles.backgroundBuilding} />
        <Image src={logoPath} style={styles.backgroundLogo} />
        <View style={styles.header}>
          <Image src={logoPath} style={styles.logo} />
          <Image src={selectedLayout === "layout1" ? Layout1 : Layout2} style={styles.layoutLogo} />
        </View>

        <Text style={styles.title}>Expenses Statement</Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.headerCell, styles.nameCell]}>Name</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.contactCell]}>Contact No.</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.receivedByCell]}>Received By</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.amountCell]}>Amount (Rs.)</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.tdsCell]}>TDS</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.netAmountCell]}>Net Amount (Rs.)</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.dateCell]}>Date</Text>
          </View>
          
          {expenses.map((expense, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.nameCell]}>{expense.name}</Text>
              <Text style={[styles.tableCell, styles.contactCell]}>{expense.contactNumber || '-'}</Text>
              <Text style={[styles.tableCell, styles.receivedByCell]}>{expense.receivedBy}</Text>
              <Text style={[styles.tableCell, styles.amountCell]}>{expense.amount.toLocaleString('en-IN')}</Text>
              <Text style={[styles.tableCell, styles.tdsCell]}>{expense.tds}%</Text>
              <Text style={[styles.tableCell, styles.netAmountCell]}>{expense.netAmount.toLocaleString('en-IN')}</Text>
              <Text style={[styles.tableCell, styles.dateCell]}>{new Date(expense.date).toLocaleDateString()}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.summaryValue}>
              Rs. {totalAmount.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Net Amount:</Text>
            <Text style={styles.summaryValue}>
              Rs. {totalNetAmount.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Generated on {new Date().toLocaleDateString()}</Text>
          <Text>Square Seven Infra</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ExpensesPDF;
