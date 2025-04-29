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
  title: {
    fontSize: 20,
    color: '#1F263E',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 3,
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
    width: '33.33%',  // Fixed width distribution
    padding: 4,
    fontSize: 10,
    color: '#2d3748',
    textAlign: 'left',
  },
  headerCell: {
    color: '#ffffff',
    fontWeight: 'bold',
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
  plotDetails: {
    marginVertical: 10,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
    width: '200px',
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    paddingVertical: 2,
  },
  total: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
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
    textAlign: 'right',
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

const SinglePaymentPDF = ({ data }) => {
  // Format date using a safe check
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch (e) {
      return dateString;
    }
  };

  // Format number with safe check
  const formatNumber = (num) => {
    try {
      return typeof num === 'number' ? num.toLocaleString('en-IN') : num;
    } catch (e) {
      return num;
    }
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

        <View style={styles.billInfo}>
          <View>
            <Text style={styles.label}>Billed To:</Text>
            <Text style={styles.value}>{data.buyerName || 'N/A'}</Text>
          </View>
          <View>
            <Text style={styles.label}>Payment No:</Text>
            <Text style={styles.value}>PMT-{(data.paymentIndex || 0) + 1}</Text>
            <View style={styles.dateGroup}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{formatDate(new Date())}</Text>
            </View>
          </View>
        </View>

        <View style={styles.plotDetails}>
          <Text style={styles.sectionTitle}>Plot Details</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.plotLabel}>Plot Number:</Text>
            <Text style={styles.plotValue}>{data.plotNumber || 'N/A'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.plotLabel}>Payment Number:</Text>
            <Text style={styles.plotValue}>{(data.paymentIndex || 0) + 1}</Text>
          </View>
        </View>

        <View style={styles.paymentsSection}>
          <Text style={styles.sectionTitle}>Payment Receipt</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.headerCell]}>Payment Date</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>Mode of Payment</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>Amount (Rs.)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>
                {formatDate(data.payment?.paymentDate)}
              </Text>
              <Text style={styles.tableCell}>{data.payment?.paymentType || 'N/A'}</Text>
              <Text style={styles.tableCell}>
                {formatNumber(data.payment?.amount)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.total}>
          <Text style={styles.totalLabel}>Amount Paid: </Text>
          <Text style={styles.totalValue}>Rs. {formatNumber(data.payment?.amount)}</Text>
        </View>

        <View style={styles.footer}>
          <Text>Generated on {formatDate(new Date())}</Text>
          <Text>Square7 Real Estate Solutions</Text>
        </View>
      </Page>
    </Document>
  );
};

export default SinglePaymentPDF;
