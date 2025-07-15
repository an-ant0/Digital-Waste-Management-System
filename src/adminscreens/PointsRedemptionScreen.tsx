import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

interface RedemptionRequest {
  id: string;
  user: string;
  points: number;
  service: 'NCELL' | 'NTC';
  phoneNumber: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  rechargeCode?: string;
}

const PointsRedemptionScreen: React.FC = () => {
  const [requests, setRequests] = useState<RedemptionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch from backend
    const dummyRequests: RedemptionRequest[] = [
      {
        id: '1',
        user: 'Ramesh K.',
        points: 100,
        service: 'NCELL',
        phoneNumber: '9801234567',
        status: 'Pending',
        requestedAt: '2025-07-15',
      },
      {
        id: '2',
        user: 'Sita M.',
        points: 150,
        service: 'NTC',
        phoneNumber: '9841234567',
        status: 'Approved',
        requestedAt: '2025-07-14',
        rechargeCode: 'NTC-9832-XYZ4',
      },
    ];

    setRequests(dummyRequests);
    setLoading(false);
  }, []);

  const approveRequest = (id: string) => {
    const code = generateRechargeCode();
    setRequests(prev =>
      prev.map(req =>
        req.id === id
          ? { ...req, status: 'Approved', rechargeCode: code }
          : req
      )
    );
    Alert.alert('Approved', `Recharge code generated:\n${code}`);
  };

  const rejectRequest = (id: string) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === id ? { ...req, status: 'Rejected' } : req
      )
    );
    Alert.alert('Rejected', 'Redemption request has been rejected.');
  };

  const generateRechargeCode = () => {
    const prefix = Math.random() > 0.5 ? 'NCELL' : 'NTC';
    const random = Math.floor(100000 + Math.random() * 900000).toString();
    return `${prefix}-${random}`;
  };

  const renderItem = ({ item }: { item: RedemptionRequest }) => (
    <View style={styles.card}>
      <Text style={styles.user}>{item.user}</Text>
      <Text style={styles.label}>Service: {item.service}</Text>
      <Text style={styles.label}>Phone: {item.phoneNumber}</Text>
      <Text style={styles.label}>Points: {item.points}</Text>
      <Text style={styles.label}>Requested: {item.requestedAt}</Text>
      <Text
        style={[
          styles.status,
          {
            color:
              item.status === 'Approved'
                ? 'green'
                : item.status === 'Rejected'
                ? 'red'
                : '#555',
          },
        ]}
      >
        Status: {item.status}
      </Text>

      {item.rechargeCode && (
        <Text style={styles.rechargeCode}>Recharge Code: {item.rechargeCode}</Text>
      )}

      {item.status === 'Pending' && (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => approveRequest(item.id)}
          >
            <Text style={styles.btnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => rejectRequest(item.id)}
          >
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} color="#1E90FF" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Points Redemption Requests</Text>
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </ScrollView>
  );
};

export default PointsRedemptionScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F4F4F4',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    elevation: 2,
  },
  user: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  label: {
    color: '#444',
    fontSize: 14,
    marginBottom: 2,
  },
  status: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  rechargeCode: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#1E90FF',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  approveBtn: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 6,
    flex: 0.48,
  },
  rejectBtn: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 6,
    flex: 0.48,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
