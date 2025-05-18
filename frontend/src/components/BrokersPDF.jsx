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
    color: '#ffffff',
    fontWeight: 'bold',
  },
  nameCell: { width: '20%' },
  phoneCell: { width: '15%' },
  addressCell: { width: '25%' },
  commissionCell: { width: '15%' },
  plotsCell: { width: '25%' },
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
  }
});

const BrokersPDF = ({ brokers, selectedLayout }) => {
  const formatPlotList = (plots) => {
    if (!plots || plots.length === 0) return '-';
    return plots.map(plot => 
      `Plot ${plot.plotNumber} (${plot.layoutId === 'layout1' ? 'Krishnam Nagar 1' : 'Krishnam Nagar 2'})`
    ).join(', ');
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

        <Text style={styles.title}>Brokers List</Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.headerCell, styles.nameCell]}>Name</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.phoneCell]}>Phone Number</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.addressCell]}>Address</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.commissionCell]}>Commission (%)</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.plotsCell]}>Plots</Text>
          </View>
          
          {brokers.map((broker, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.nameCell]}>{broker.name}</Text>
              <Text style={[styles.tableCell, styles.phoneCell]}>{broker.phoneNumber}</Text>
              <Text style={[styles.tableCell, styles.addressCell]}>{broker.address || '-'}</Text>
              <Text style={[styles.tableCell, styles.commissionCell]}>
                {broker.commission ? `${broker.commission}%` : '-'}
              </Text>
              <Text style={[styles.tableCell, styles.plotsCell]}>
                {formatPlotList(broker.plots)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Generated on {new Date().toLocaleDateString()}</Text>
          <Text>Square Seven Infra</Text>
        </View>
      </Page>
    </Document>
  );
};

export default BrokersPDF;
