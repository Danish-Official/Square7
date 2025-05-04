import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logoPath from "@/assets/logo.png";
import Layout from "@/assets/Layout.png";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#ffffff',
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
  layoutLogo: {
    width: 100,
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
    padding: 4,
    fontSize: 9,
    color: '#2d3748',
  },
  plotNumberCell: { width: '6%' },
  areaSqFtCell: { width: '9%' },
  areaSqMtCell: { width: '9%' },
  buyerCell: { width: '16%' },
  contactCell: { width: '11%' },
  addressCell: { width: '22%' },
  dateCell: { width: '9%' },
  amountCell: { width: '18%' },
  headerCell: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#666666',
    fontSize: 10,
    borderTop: '1 solid #dee2e6',
    paddingTop: 5,
  }
});

const SoldPlotsListPDF = ({ plots, layoutName }) => {
  // Helper function to safely calculate total paid amount
  const calculateTotalPaid = (plot) => {
    // First try using payments array if available
    if (Array.isArray(plot?.invoice?.payments)) {
      return plot.invoice.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    }
    // Fallback to totalPaid property
    return typeof plot.totalPaid === 'number' ? plot.totalPaid : 0;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoPath} style={styles.logo} />
          <Image src={Layout} style={styles.layoutLogo} />
          <View style={styles.address}>
            <Text>HINGNA NAGPUR 441110</Text>
            <Text>Contact: +91 XXXXXXXXXX</Text>
            <Text>Email: info@square7.com</Text>
          </View>
        </View>

        <Text style={styles.title}>Sold Plots List - {layoutName}</Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.headerCell, styles.plotNumberCell]}>Plot No.</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.areaSqFtCell]}>Area (sq ft)</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.areaSqMtCell]}>Area (sq mt)</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.buyerCell]}>Buyer Name</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.contactCell]}>Contact</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.addressCell]}>Address</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.dateCell]}>Date</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.amountCell]}>Amount Paid (Rs.)</Text>
          </View>
          
          {plots.sort((a, b) => a.plotNumber - b.plotNumber).map((plot, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.plotNumberCell]}>{plot.plotNumber}</Text>
              <Text style={[styles.tableCell, styles.areaSqFtCell]}>{plot.areaSqFt.toLocaleString()}</Text>
              <Text style={[styles.tableCell, styles.areaSqMtCell]}>{plot.areaSqMt.toLocaleString()}</Text>
              <Text style={[styles.tableCell, styles.buyerCell]}>{plot.buyer}</Text>
              <Text style={[styles.tableCell, styles.contactCell]}>{plot.contact}</Text>
              <Text style={[styles.tableCell, styles.addressCell]}>{plot.address}</Text>
              <Text style={[styles.tableCell, styles.dateCell]}>
                {plot.bookingDate ? new Date(plot.bookingDate).toLocaleDateString() : '-'}
              </Text>
              <Text style={[styles.tableCell, styles.amountCell]}>
                {calculateTotalPaid(plot).toLocaleString('en-IN')}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Generated on {new Date().toLocaleDateString()}</Text>
          <Text>Square7 Real Estate Solutions</Text>
        </View>
      </Page>
    </Document>
  );
};

export default SoldPlotsListPDF;
