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
    marginBottom: 12,
    borderBottom: '2 solid #1F263E',
    paddingBottom: 8,
  },
  logo: {
    width: 60,
    height: 60,
  },
  layoutLogo: {
    width: 90,
    height: 60,
  },
  companyInfo: {
    fontSize: 9,
    textAlign: 'right',
    width: '30%',
    color: '#666666',
  },
  section: {
    marginVertical: 8,
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#1F263E',
    fontWeight: 'bold',
    marginBottom: 6,
    borderBottom: '1 solid #dee2e6',
    paddingBottom: 3,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  label: {
    fontSize: 9,
    color: '#4a5568',
    width: '30%',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 9,
    color: '#2d3748',
    width: '70%',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    color: '#666666',
    fontSize: 8,
    borderTop: '1 solid #dee2e6',
    paddingTop: 5,
  }
});

const BuyerDetailsPDF = ({ data }) => (
  <Document>
    <Page size="A5" style={styles.page}>
      <View style={styles.header}>
        <Image src={logoPath} style={styles.logo} />
        <Image src={Layout} style={styles.layoutLogo} />
        <View style={styles.companyInfo}>
          <Text>HINGNA NAGPUR 441110</Text>
          <Text>Contact: +91 XXXXXXXXXX</Text>
          <Text>Email: info@square7.com</Text>
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{data.buyerName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone Number:</Text>
          <Text style={styles.value}>{data.phoneNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{data.address}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Gender:</Text>
          <Text style={styles.value}>{data.gender}</Text>
        </View>
      </View>

      {/* Plot Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plot Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Plot Number:</Text>
          <Text style={styles.value}>{data.plot.plotNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Area:</Text>
          <Text style={styles.value}>{data.plot.areaSqFt} sq ft</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Rate per sq ft:</Text>
          <Text style={styles.value}>Rs. {Math.ceil(data.totalCost / data.plot.areaSqFt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Cost:</Text>
          <Text style={styles.value}>Rs. {data.totalCost}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleDateString()}</Text>
        <Text>Square7 Real Estate Solutions</Text>
      </View>
    </Page>
  </Document>
);

export default BuyerDetailsPDF;
