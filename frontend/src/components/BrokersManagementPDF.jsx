

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import bgBuilding from '@/assets/bg-building.png';
import logoPath from '@/assets/logo.png';
import Layout1 from "@/assets/layouts/layoutblue1.png";
import Layout2 from "@/assets/layouts/layoutblue2.png";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#ffffff',
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
  },
  headerCell: {
    color: 'white',
    fontWeight: 'bold'
  },
  nameCell: { width: '33%' },
  phoneCell: { width: '25%' },
  addressCell: { width: '42%' },
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


const BrokersManagementPDF = ({ brokers = [] }) => (
  // Defensive: filter out null/undefined brokers
  <Document>
    <Page size="A4" style={styles.page}>
      <Image src={bgBuilding} style={styles.backgroundBuilding} />
      <Image src={logoPath} style={styles.backgroundLogo} />
      <View style={styles.header}>
        <Image src={logoPath} style={styles.logo} />
        <Image src={Layout1} style={styles.layoutLogo} />
      </View>
      <Text style={styles.title}>Advisors List</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.headerCell, styles.nameCell]}>Name</Text>
          <Text style={[styles.tableCell, styles.headerCell, styles.phoneCell]}>Contact No.</Text>
          <Text style={[styles.tableCell, styles.headerCell, styles.addressCell]}>Address</Text>
        </View>
        {(brokers || []).filter(b => b && typeof b === 'object').length === 0 ? (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.nameCell]}>No brokers found.</Text>
            <Text style={[styles.tableCell, styles.phoneCell]}></Text>
            <Text style={[styles.tableCell, styles.addressCell]}></Text>
          </View>
        ) : (
          (brokers || []).filter(b => b && typeof b === 'object').map((broker, idx) => (
            <View style={styles.tableRow} key={broker._id || idx}>
              <Text style={[styles.tableCell, styles.nameCell]}>{broker.name || '-'}</Text>
              <Text style={[styles.tableCell, styles.phoneCell]}>{broker.phoneNumber || '-'}</Text>
              <Text style={[styles.tableCell, styles.addressCell]}>{broker.address || '-'}</Text>
            </View>
          ))
        )}
      </View>
      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleDateString()}</Text>
        <Text>Square Seven Infra</Text>
      </View>
    </Page>
  </Document>
);

export default BrokersManagementPDF;
