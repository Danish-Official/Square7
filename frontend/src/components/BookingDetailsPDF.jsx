import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logoPath from "@/assets/logo.png";
import Layout1 from "@/assets/layouts/layoutblue1.png";
import Layout2 from "@/assets/layouts/layoutblue2.png";

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
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 10,
    color: '#4a5568',
    width: '30%',
    fontWeight: 'bold',
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
    textAlign: 'right',
    color: '#666666',
    fontSize: 10,
    borderTop: '1 solid #dee2e6',
    paddingTop: 5,
    textTransform: 'uppercase',
  }
});

const BookingDetailsPDF = ({ data, selectedLayout }) => {
  // Add validation
  if (!data || !data.booking || !data.plotDetails || !data.payments) {
    console.error('Invalid data structure:', data);
    return null;
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <Image src={logoPath} style={styles.logo} />
          <Image src={selectedLayout === "layout1" ? Layout1 : Layout2} style={styles.layoutLogo} />
        </View>

        {/* Personal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Buyer Name:</Text>
            <Text style={styles.value}>{data.booking.buyerName || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Phone Number:</Text>
            <Text style={styles.value}>{data.booking.phoneNumber || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{data.booking.email || 'Not provided'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{data.booking.address || 'N/A'}</Text>
          </View>
        </View>

        {/* Plot Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plot Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Plot Number:</Text>
            <Text style={styles.value}>{data.plotDetails.plotNumber || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Area (sq ft):</Text>
            <Text style={styles.value}>{data.plotDetails.areaSqFt || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Area (sq mt):</Text>
            <Text style={styles.value}>{data.plotDetails.areaSqMt || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Total Cost:</Text>
            <Text style={styles.value}>Rs. {data.plotDetails.totalCost || 'N/A'}</Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Booking Payment:</Text>
            <Text style={styles.value}>Rs. {data.payments[0]?.amount || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Payment Type:</Text>
            <Text style={styles.value}>{data.payments[0]?.paymentType || 'N/A'}</Text>
          </View>
          {data.payments[0]?.narration && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Narration:</Text>
              <Text style={styles.value}>{data.payments[0].narration}</Text>
            </View>
          )}
        </View>

        {/* Documents Section */}
        {data.documents && data.documents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documents</Text>
            {data.documents.map((doc, index) => (
              <View style={styles.detailRow} key={index}>
                <Text style={styles.label}>
                  {doc.type === 'aadharCardFront' ? 'Aadhar Card (Front)' :
                    doc.type === 'aadharCardBack' ? 'Aadhar Card (Back)' :
                      'PAN Card'}:
                </Text>
                <Text style={styles.value}>{doc.originalName || 'Uploaded'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Broker Details if available, else show fallback */}
        {data.broker && typeof data.broker === 'object' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Advisor Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{data.broker.name || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Phone Number:</Text>
              <Text style={styles.value}>{data.broker.phoneNumber || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Commission:</Text>
              <Text style={styles.value}>{data.broker.commission ? `${data.broker.commission}%` : '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Commission Amount:</Text>
              <Text style={styles.value}>Rs. {data.broker.amount || 0}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>TDS ({data.booking.tdsPercentage || 0}%):</Text>
              <Text style={styles.value}>Rs. {data.broker.tdsAmount || 0}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Net Amount:</Text>
              <Text style={styles.value}>Rs. {data.broker.netAmount || 0}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Advisor Details</Text>
            <Text style={styles.value}>No advisor assigned.</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>Generated on {new Date().toLocaleDateString()}</Text>
          <Text>Square Seven Infra</Text>
        </View>
      </Page>
    </Document>
  );
};

export default BookingDetailsPDF;
