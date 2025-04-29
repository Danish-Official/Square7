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
  billInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
  },
  label: {
    fontSize: 10,
    color: '#4a5568',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  value: {
    fontSize: 11,
    color: '#2d3748',
  },
  dateGroup: {
    marginTop: 8,
  },
  table: {
    marginVertical: 5,
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
    flex: 1,
    padding: 4,
    fontSize: 10,
    color: '#2d3748',
  },
  headerCell: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  plotDetails: {
    marginVertical: 10,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
    width: '200px',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    alignItems: 'center',
  },
  plotLabel: {
    width: '40%',
    fontSize: 10,
    color: '#4a5568',
    fontWeight: 'bold',
  },
  plotValue: {
    width: '60%',
    fontSize: 11,
    color: '#2d3748',
    paddingLeft: 10,
  },
  paymentsSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#1F263E',
    fontWeight: 'bold',
    marginBottom: 5,
    borderBottom: '1 solid #dee2e6',
    paddingBottom: 4,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F263E',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F263E',
  },
  total: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
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

const InvoicePDF = ({ data }) => (
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

      {/* Billing Information */}
      <View style={styles.billInfo}>
        <View>
          <Text style={styles.label}>Billed To:</Text>
          <Text style={styles.value}>{data.booking.buyerName}</Text>
          <Text style={styles.value}>{data.booking.address}</Text>
        </View>
        <View>
          <Text style={styles.label}>Invoice No:</Text>
          <Text style={styles.value}>{data._id}</Text>
          <View style={styles.dateGroup}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>
      </View>

      {/* Plot Details */}
      <View style={styles.plotDetails}>
        <Text style={styles.sectionTitle}>Plot Details</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.plotLabel}>Plot Number:</Text>
          <Text style={styles.plotValue}>{data.booking.plot.plotNumber}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.plotLabel}>Area:</Text>
          <Text style={styles.plotValue}>{data.booking.plot.areaSqFt} sq ft</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.plotLabel}>Rate per sq ft:</Text>
          <Text style={styles.plotValue}>Rs. {(data.booking.totalCost / data.booking.plot.areaSqFt).toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.plotLabel}>Total Plot Cost:</Text>
          <Text style={styles.plotValue}>Rs. {data.booking.totalCost}</Text>
        </View>
      </View>

      {/* Payments Section */}
      <View style={styles.paymentsSection}>
        <Text style={styles.sectionTitle}>Payment History</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.headerCell]}>Sr. No.</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Date</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Payment Type</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Amount (Rs.)</Text>
          </View>
          {data.payments.map((payment, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{index + 1}</Text>
              <Text style={styles.tableCell}>{new Date(payment.paymentDate).toLocaleDateString()}</Text>
              <Text style={styles.tableCell}>{payment.paymentType}</Text>
              <Text style={styles.tableCell}>{payment.amount}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.total}>
        <Text style={styles.totalLabel}>Total Amount Paid:{" "}</Text>
        <Text style={styles.totalValue}>
          Rs. {data.payments.reduce((sum, payment) => sum + payment.amount, 0)}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleDateString()}</Text>
        <Text>Square7 Real Estate Solutions</Text>
      </View>
    </Page>
  </Document>
);

export default InvoicePDF;
