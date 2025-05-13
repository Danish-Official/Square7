import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import Layout1 from "@/assets/layouts/layoutblue1.png";
import Layout2 from "@/assets/layouts/layoutblue2.png";
import bgBuilding from "@/assets/bg-building.png";
import logoPath from "@/assets/logo.png";

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
  logo: {
    width: 70,
    height: 70,
  },
  layoutLogo: {
    width: 140,
    height: 70,
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
    width: '300px',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    alignItems: 'center',
    gap: 2
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
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    gap: 20,
  },
  totalItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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

const InvoicePDF = ({ data, selectedLayout }) => {
  const calculateTotalPaid = () => {
    return data.payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getRemainingAmount = () => {
    const totalPaid = calculateTotalPaid();
    const remaining = data.booking.totalCost - totalPaid;
    return Math.max(0, remaining); // Ensure remaining amount doesn't go negative
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={bgBuilding} style={styles.backgroundBuilding} />
        <Image src={logoPath} style={styles.backgroundLogo} />
        <View style={styles.header}>
          <Image src={logoPath} style={styles.logo} />
          <Image src={selectedLayout === "layout1" ? Layout1 : Layout2} style={styles.layoutLogo} />
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
              <Text style={[styles.tableCell, styles.headerCell]}>Narration</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>Amount (Rs.)</Text>
            </View>
            {data.payments.map((payment, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{index + 1}</Text>
                <Text style={styles.tableCell}>{new Date(payment.paymentDate).toLocaleDateString()}</Text>
                <Text style={styles.tableCell}>{payment.paymentType}</Text>
                <Text style={styles.tableCell}>{payment.narration || '-'}</Text>
                <Text style={styles.tableCell}>{payment.amount}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.total}>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Total Amount Paid:</Text>
            <Text style={styles.totalValue}>
              Rs. {calculateTotalPaid()}
            </Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Remaining Amount:</Text>
            <Text style={styles.totalValue}>
              Rs. {getRemainingAmount()}
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

export default InvoicePDF;
