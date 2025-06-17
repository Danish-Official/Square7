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
  srNoCell: { width: '5%' }, // Add serial number column
  nameCell: { width: '18%' }, // Adjusted width
  phoneCell: { width: '15%' },
  dateCell: { width: '20%' },
  commissionCell: { width: '15%' },
  plotsCell: { width: '27%' }, // Adjusted width
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

const BrokersPDF = ({ brokers, selectedLayout }) => {
  const formatPlotList = (plots) => {
    if (!plots || plots.length === 0) return '-';
    return plots.map(plot => 
      `Plot ${plot.plotNumber} (${plot.layoutId === 'layout1' ? 'Krishnam Nagar 1' : 'Krishnam Nagar 2'})`
    ).join(', ');
  };

  const calculateBrokerFinancials = (broker) => {
    const plots = broker.plots || [];
    const amount = plots.reduce((sum, plot) => {
      const plotCommission = (plot.totalCost * (broker.commission || 0)) / 100;
      return sum + plotCommission;
    }, 0);
    const tdsPercentage = broker.tdsPercentage || 5;
    const tdsAmount = (amount * tdsPercentage) / 100;
    const netAmount = amount - tdsAmount;

    return {
      amount: Math.round(amount),
      tdsAmount: Math.round(tdsAmount),
      netAmount: Math.round(netAmount),
      tdsPercentage
    };
  };

  const brokersWithCalculations = brokers.map(broker => ({
    ...broker,
    ...calculateBrokerFinancials(broker)
  }));

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
            <Text style={[styles.tableCell, styles.headerCell, styles.srNoCell]}>Sr. No.</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.nameCell]}>Name</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.phoneCell]}>Phone Number</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.dateCell]}>Date</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.commissionCell]}>Commission (%)</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.plotsCell]}>Plots</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.commissionCell]}>Amount</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.commissionCell]}>TDS</Text>
            <Text style={[styles.tableCell, styles.headerCell, styles.commissionCell]}>Net Amount</Text>
          </View>
          
          {brokersWithCalculations.map((broker, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.srNoCell]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.nameCell]}>{broker.name}</Text>
              <Text style={[styles.tableCell, styles.phoneCell]}>{broker.phoneNumber}</Text>
              <Text style={[styles.tableCell, styles.dateCell]}>
                {broker.date ? new Date(broker.date).toLocaleDateString() : '-'}
              </Text>
              <Text style={[styles.tableCell, styles.commissionCell]}>
                {broker.commission ? `${broker.commission}%` : '-'}
              </Text>
              <Text style={[styles.tableCell, styles.plotsCell]}>
                {formatPlotList(broker.plots)}
              </Text>
              <Text style={[styles.tableCell, styles.commissionCell]}>
                ₹{broker.amount || 0}
              </Text>
              <Text style={[styles.tableCell, styles.commissionCell]}>
                {broker.tdsAmount ? `₹${broker.tdsAmount} (${broker.tdsPercentage}%)` : '-'}
              </Text>
              <Text style={[styles.tableCell, styles.commissionCell]}>
                ₹{broker.netAmount || 0}
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
