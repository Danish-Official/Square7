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
    width: 140,
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
  billInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 10,
    padding: 10,
    borderRadius: 4,
  },
  dateGroup: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 10,
    color: '#4a5568',
    fontWeight: 'bold',
    marginRight: 5,
  },
  paymentValue: {
    fontSize: 11,
    color: '#2d3748',
  },
  dateLabel: {
    fontSize: 10,
    color: '#4a5568',
    fontWeight: 'bold',
    marginRight: 5,
  },
  dateValue: {
    fontSize: 11,
    color: '#2d3748',
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
    width: '25%',  // Adjusted width distribution to accommodate new column
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
    marginTop: 5,
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
    textAlign: 'right',
    color: '#666666',
    fontSize: 10,
    borderTop: '1 solid #dee2e6',
    paddingTop: 5,
    textTransform: 'uppercase',
  }
});

const InvoicePDF = ({ data, selectedLayout }) => {
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
        <Image src={bgBuilding} style={styles.backgroundBuilding} />
        <Image src={logoPath} style={styles.backgroundLogo} />
        <View style={styles.header}>
          <Image src={logoPath} style={styles.logo} />
          <Image src={selectedLayout === "layout1" ? Layout1 : Layout2} style={styles.layoutLogo} />
        </View>

        <View style={styles.billInfo}>
          <View>
            <Text style={styles.label}>Billed To:</Text>
            <Text style={styles.value}>{data.buyerName || 'N/A'}</Text>
            <Text style={styles.value}>{data.value || 'N/A'}</Text>
          </View>
          <View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Invoice No:</Text>
              <Text style={styles.paymentValue}>INV-{data.invoiceNumber  || 0}</Text>
            </View>
            <View style={styles.dateGroup}>
              <Text style={styles.dateLabel}>Date:</Text>
              <Text style={styles.dateValue}>{new Date().toLocaleDateString()}</Text>
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
            <Text style={styles.plotLabel}>Area:</Text>
            <Text style={styles.plotValue}>{data.areaSqFt || 'N/A'} sq. ft.</Text>
          </View>
        </View>

        <View style={styles.paymentsSection}>
          <Text style={styles.sectionTitle}>Payment Receipt</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.headerCell]}>Payment Date</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>Mode of Payment</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>Narration</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>Amount (Rs.)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>
                {formatDate(data.payment?.paymentDate)}
              </Text>
              <Text style={styles.tableCell}>{data.payment?.paymentType || 'N/A'}</Text>
              <Text style={styles.tableCell}>{data.payment?.narration || '-'}</Text>
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
          <Text>Generated on {new Date().toLocaleDateString()}</Text>
          <Text>Square Seven Infra</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
