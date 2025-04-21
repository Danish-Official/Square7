import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logoPath from "@/assets/logo.png";
import Layout from "@/assets/Layout.png"; // Import layout images

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    // marginTop: 30,
  },
  billInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  billTo: {
    width: '50%',
  },
  invoiceInfo: {
    width: '40%',
  },
  table: {
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 5,
  },
  tableHeader: {
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 10,
  },
  label: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
    marginTop: 10,
  },
  value: {
    fontSize: 11,
  },
  total: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingRight: 20,
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 100,
  },
});

const InvoicePDF = ({ data }) => (
  <Document>
    <Page size="A5" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Image src= {logoPath} style={styles.logo} />
        <Image src={Layout} style={styles.layoutLogo} />
        <View style={styles.address}>
          <Text>HINGNA NAGPUR 441110</Text>
        </View>
      </View>

      {/* Billing Information */}
      <View style={styles.billInfo}>
        <View style={styles.billTo}>
          <Text style={styles.label}>Billed To:</Text>
          <Text style={styles.value}>{data.booking.buyerName}</Text>
          <Text style={styles.value}>{data.booking.address}</Text>
        </View>
        <View style={styles.invoiceInfo}>
          <Text style={styles.label}>Invoice No:</Text>
          <Text style={styles.value}>{data._id}</Text>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>
            {new Date(data.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Payments Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>Sr. No.</Text>
          <Text style={styles.tableCell}>Plot No.</Text>
          <Text style={styles.tableCell}>Area (sq ft)</Text>
          <Text style={styles.tableCell}>Rate (₹/sq ft)</Text>
          <Text style={styles.tableCell}>Amount Paid (₹)</Text>
        </View>
        {data.payments.map((payment, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{index + 1}</Text>
            <Text style={styles.tableCell}>{data.booking.plot.plotNumber}</Text>
            <Text style={styles.tableCell}>{data.booking.plot.areaSqFt}</Text>
            <Text style={styles.tableCell}>{data.booking.totalCost / data.booking.plot.areaSqFt}</Text>
            <Text style={styles.tableCell}>{payment.amount}</Text>
          </View>
        ))}
      </View>

      {/* Total Section */}
      <View style={styles.total}>
        <Text style={styles.totalLabel}>Total Amount Paid:</Text>
        <Text style={styles.totalValue}>
          ₹{data.payments.reduce((sum, payment) => sum + payment.amount, 0)}
        </Text>
      </View>
    </Page>
  </Document>
);

export default InvoicePDF;
