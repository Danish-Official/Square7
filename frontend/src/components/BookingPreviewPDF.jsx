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
  section: {
    marginVertical: 10,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#1F263E',
    fontWeight: 'bold',
    marginBottom: 8,
    borderBottom: '1 solid #dee2e6',
    paddingBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    marginVertical: 3,
  },
  label: {
    fontSize: 10,
    color: '#4a5568',
    width: '30%',
  },
  value: {
    fontSize: 10,
    color: '#2d3748',
    width: '70%',
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

const BookingPreviewPDF = ({ data }) => (
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

      {/* Personal Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Buyer Name:</Text>
          <Text style={styles.value}>{data.booking.buyerName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Phone Number:</Text>
          <Text style={styles.value}>{data.booking.phoneNumber}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{data.booking.address}</Text>
        </View>
      </View>

      {/* Plot Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plot Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Plot Number:</Text>
          <Text style={styles.value}>{data.plotDetails.plotNumber}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Area:</Text>
          <Text style={styles.value}>{data.plotDetails.areaSqFt} sq ft</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Rate per sq ft:</Text>
          <Text style={styles.value}>Rs. {data.plotDetails.ratePerSqFt}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Total Cost:</Text>
          <Text style={styles.value}>Rs. {data.plotDetails.totalCost}</Text>
        </View>
      </View>

      {/* Payment Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>First Payment:</Text>
          <Text style={styles.value}>Rs. {data.payments[0].amount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Payment Type:</Text>
          <Text style={styles.value}>{data.payments[0].paymentType}</Text>
        </View>
        {data.brokerReference && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Broker Reference:</Text>
            <Text style={styles.value}>{data.brokerReference}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleDateString()}</Text>
        <Text>Square7 Real Estate Solutions</Text>
      </View>
    </Page>
  </Document>
);

export default BookingPreviewPDF;
