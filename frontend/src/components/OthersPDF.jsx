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
    fontSize: 9,
    color: '#2d3748',
    padding: 4,
  },
  headerCell: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  nameCell: { width: '20%' },
  descriptionCell: { width: '40%' },
  amountCell: { width: '20%' },
  dateCell: { width: '20%' },
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

const OthersPDF = ({ entries, selectedLayout }) => {
  const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={bgBuilding} style={styles.backgroundBuilding} />
        <Image src={logoPath} style={styles.backgroundLogo} />
        <View style={styles.header}>
          <Image src={logoPath} style={styles.logo} />
          <Image src={selectedLayout === "layout1" ? Layout1 : Layout2} style={styles.layoutLogo} />
        </View>

        <Text style={styles.title}>Others Statement</Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.headerCell, styles.nameCell]}>Name</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.descriptionCell]}>Description</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.amountCell]}>Amount (Rs.)</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.dateCell]}>Date</Text>
          </View>
          
          {entries.map((entry, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.nameCell]}>{entry.name}</Text>
              <Text style={[styles.tableCell, styles.descriptionCell]}>{entry.description}</Text>
              <Text style={[styles.tableCell, styles.amountCell]}>{entry.amount.toLocaleString('en-IN')}</Text>
              <Text style={[styles.tableCell, styles.dateCell]}>
                {new Date(entry.date).toLocaleDateString()}
              </Text>
            </View>
          ))}

          <View style={[styles.tableRow, { marginTop: 10 }]}>
            <Text style={[styles.tableCell, styles.nameCell]}></Text>
            <Text style={[styles.tableCell, styles.descriptionCell, { fontWeight: 'bold' }]}>Total</Text>
            <Text style={[styles.tableCell, styles.amountCell, { fontWeight: 'bold' }]}>
              {totalAmount.toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.tableCell, styles.dateCell]}></Text>
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

export default OthersPDF;
