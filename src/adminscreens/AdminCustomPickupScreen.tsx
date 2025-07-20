import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';

type PickupRequest = {
  id: string;
  user: string;
  address: string;
  date: string;
  price: number;
  paymentStatus: 'Paid' | 'Unpaid';
  status: 'Pending' | 'Completed';
};

const sampleRequests: PickupRequest[] = [
  {
    id: '1',
    user: 'Ram Prasad',
    address: 'Ward 5, Main Street, Dharan',
    date: '2025-07-15',
    price: 200,
    paymentStatus: 'Unpaid',
    status: 'Pending',
  },
  {
    id: '2',
    user: 'Sita Kumari',
    address: 'Ward 3, Buddha Chowk, Biratnagar',
    date: '2025-07-14',
    price: 200,
    paymentStatus: 'Paid',
    status: 'Completed',
  },
];

const AdminCustomPickupScreen: React.FC = () => {
  const [requests, setRequests] = useState<PickupRequest[]>([]);

  useEffect(() => {
    // Simulate fetching data from backend
    setRequests(sampleRequests);
  }, []);

  const handlePayment = (id: string) => {
    Alert.alert('Payment Confirmation', 'Proceed to pay Rs. 200?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Pay',
        onPress: () => {
          setRequests((prev) =>
            prev.map((r) =>
              r.id === id ? { ...r, paymentStatus: 'Paid' } : r
            )
          );
        },
      },
    ]);
  };

  const handleMarkCompleted = (id: string) => {
    Alert.alert('Mark Completed', 'Confirm this pickup is completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          setRequests((prev) =>
            prev.map((r) =>
              r.id === id ? { ...r, status: 'Completed' } : r
            )
          );
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Pickup Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.label}>
              User: <Text style={styles.value}>{item.user}</Text>
            </Text>
            <Text style={styles.label}>
              Address: <Text style={styles.value}>{item.address}</Text>
            </Text>
            <Text style={styles.label}>
              Date: <Text style={styles.value}>{item.date}</Text>
            </Text>
            <Text style={styles.label}>
              Amount: <Text style={styles.value}>Rs. {item.price}</Text>
            </Text>
            <Text style={styles.label}>
              Payment:{' '}
              <Text
                style={[
                  styles.value,
                  item.paymentStatus === 'Paid' ? styles.paid : styles.unpaid,
                ]}
              >
                {item.paymentStatus}
              </Text>
            </Text>
            <Text style={styles.label}>
              Status:{' '}
              <Text
                style={[
                  styles.value,
                  item.status === 'Pending' ? styles.pending : styles.completed,
                ]}
              >
                {item.status}
              </Text>
            </Text>

            {item.status === 'Pending' && item.paymentStatus === 'Unpaid' && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => handlePayment(item.id)}
              >
                <Text style={styles.buttonText}>Pay Now</Text>
              </TouchableOpacity>
            )}

            {item.status === 'Pending' && item.paymentStatus === 'Paid' && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#2ecc71' }]}
                onPress={() => handleMarkCompleted(item.id)}
              >
                <Text style={styles.buttonText}>Mark as Completed</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default AdminCustomPickupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  value: {
    fontWeight: '600',
    color: '#111',
  },
  pending: {
    color: '#E67E22',
  },
  completed: {
    color: '#27AE60',
  },
  paid: {
    color: '#27AE60',
  },
  unpaid: {
    color: '#E74C3C',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#3498DB',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
