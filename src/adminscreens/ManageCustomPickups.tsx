import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import axios from 'axios'; // Import axios

// Define API base URL
const API_BASE_URL = 'http://192.168.1.76:5000'; // Use your actual backend IP/port

// Updated PickupRequest type to match backend schema
type PickupRequest = {
  _id: string; // Changed from 'id' to '_id' to match MongoDB
  user: string; // The ObjectId of the user
  userName: string;
  userPhone: string;
  userEmail: string;
  address: string;
  date: string; // Date string from backend
  timeSlot: string;
  price: number;
  paymentStatus: 'Unpaid' | 'Paid';
  status: 'Pending' | 'Completed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
};

const ManageCustomPickupScreen: React.FC = () => {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/custompickups`);
      setRequests(response.data);
    } catch (err: any) {
      console.error('Error fetching custom pickup requests:', err);
      setError('Failed to load custom pickup requests. Please try again.');
      Alert.alert('Error', 'Failed to load custom pickup requests. Ensure backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, [fetchRequests]);


  const handlePayment = async (id: string) => {
    // Optimistic update
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req._id === id ? { ...req, paymentStatus: 'Paid' } : req
      )
    );
    try {
      await axios.put(`${API_BASE_URL}/api/custompickups/${id}/pay`);
      Alert.alert('Success', 'Payment status updated to Paid.');
    } catch (error: any) {
      console.error('Error updating payment status:', error.response?.data || error.message);
      Alert.alert('Error', `Failed to update payment status: ${error.response?.data?.message || error.message}`);
      // Revert optimistic update on error
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === id ? { ...req, paymentStatus: 'Unpaid' } : req
        )
      );
    }
  };

  const handleMarkCompleted = async (id: string) => {
    // Optimistic update
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req._id === id ? { ...req, status: 'Completed' } : req
      )
    );
    try {
      await axios.put(`${API_BASE_URL}/api/custompickups/${id}/complete`);
      Alert.alert('Success', 'Request marked as Completed.');
    } catch (error: any) {
      console.error('Error marking as completed:', error.response?.data || error.message);
      Alert.alert('Error', `Failed to mark as completed: ${error.response?.data?.message || error.message}`);
      // Revert optimistic update on error
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === id ? { ...req, status: 'Pending' } : req
        )
      );
    }
  };

  const handleCancelRequest = async (id: string) => {
    // Optimistic update
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req._id === id ? { ...req, status: 'Cancelled' } : req
      )
    );
    try {
      await axios.put(`${API_BASE_URL}/api/custompickups/${id}/cancel`);
      Alert.alert('Success', 'Request cancelled.');
    } catch (error: any) {
      console.error('Error cancelling request:', error.response?.data || error.message);
      Alert.alert('Error', `Failed to cancel request: ${error.response?.data?.message || error.message}`);
      // Revert optimistic update on error
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === id ? { ...req, status: 'Pending' } : req
        )
      );
    }
  };

  const renderItem = ({ item }: { item: PickupRequest }) => (
    <View style={styles.card}>
      <Text style={styles.label}>User: <Text style={styles.value}>{item.userName}</Text></Text>
      <Text style={styles.label}>Phone: <Text style={styles.value}>{item.userPhone}</Text></Text>
      <Text style={styles.label}>Email: <Text style={styles.value}>{item.userEmail}</Text></Text>
      <Text style={styles.label}>Address: <Text style={styles.value}>{item.address}</Text></Text>
      <Text style={styles.label}>Date: <Text style={styles.value}>{new Date(item.date).toLocaleDateString()}</Text></Text>
      <Text style={styles.label}>Time Slot: <Text style={styles.value}>{item.timeSlot}</Text></Text>
      <Text style={styles.label}>Price: <Text style={styles.value}>NPR {item.price}</Text></Text>
      <Text style={[styles.label, styles.statusLabel]}>
        Payment: <Text style={[styles.value, item.paymentStatus === 'Paid' ? styles.paidStatus : styles.unpaidStatus]}>
          {item.paymentStatus}
        </Text>
      </Text>
      <Text style={[styles.label, styles.statusLabel]}>
        Status: <Text style={[styles.value, item.status === 'Completed' ? styles.completedStatus : item.status === 'Cancelled' ? styles.cancelledStatus : styles.pendingStatus]}>
          {item.status}
        </Text>
      </Text>

      <View style={styles.actionsContainer}>
        {item.paymentStatus === 'Unpaid' && item.status === 'Pending' && (
          <TouchableOpacity
            style={[styles.button, styles.payButton]}
            onPress={() => handlePayment(item._id)}
          >
            <Text style={styles.buttonText}>Mark as Paid</Text>
          </TouchableOpacity>
        )}

        {item.status === 'Pending' && item.paymentStatus === 'Paid' && (
          <TouchableOpacity
            style={[styles.button, styles.completeButton]}
            onPress={() => handleMarkCompleted(item._id)}
          >
            <Text style={styles.buttonText}>Mark as Completed</Text>
          </TouchableOpacity>
        )}

        {/* Add a Cancel button for pending requests */}
        {item.status === 'Pending' && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => handleCancelRequest(item._id)}
          >
            <Text style={styles.buttonText}>Cancel Request</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading custom pickup requests...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRequests}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Custom Pickups</Text>
      <FlatList
        data={requests}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>No custom pickup requests found.</Text>
          </View>
        }
      />
    </View>
  );
};

export default ManageCustomPickupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
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
  statusLabel: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  paidStatus: {
    color: '#28a745', // Green
    fontWeight: 'bold',
  },
  unpaidStatus: {
    color: '#dc3545', // Red
    fontWeight: 'bold',
  },
  pendingStatus: {
    color: '#ffc107', // Orange/Amber
    fontWeight: 'bold',
  },
  completedStatus: {
    color: '#17a2b8', // Info blue
    fontWeight: 'bold',
  },
  cancelledStatus: {
    color: '#6c757d', // Grey
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  payButton: {
    backgroundColor: '#007BFF', // Blue
  },
  completeButton: {
    backgroundColor: '#2ecc71', // Green
  },
  cancelButton: {
    backgroundColor: '#ff5c5c', // Reddish for cancel
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F8FA',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 16,
    color: '#888',
  },
});