import React, { useEffect, useState, useCallback } from 'react'; // Added useCallback
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl, // Added RefreshControl
} from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation for i18n
import { API_URL } from '../config'; // Import API_URL from config


interface RedemptionRequest {
  _id: string; // Use _id as per MongoDB convention
  userId: string; // Add userId to link to the user
  userName: string; // Add userName for display
  points: number;
  service: 'NCELL' | 'NTC' | 'Garbage Bag Pack'; // Adjusted service type to include garbage bag
  phoneNumber?: string; // Optional for non-recharge rewards
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  rechargeCode?: string; // Optional recharge code
}

const PointsRedemptionScreen: React.FC = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  const [requests, setRequests] = useState<RedemptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // New error state
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh

  // Function to fetch redemption requests from the backend
  const fetchRedemptionRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/redemption-requests`);
      const data = await response.json();

      if (response.ok) {
        setRequests(data);
      } else {
        throw new Error(data.message || t('failedToLoadRequests'));
      }
    } catch (err: any) {
      console.error('Failed to fetch redemption requests:', err);
      setError(err.message || t('networkErrorMessage'));
      Alert.alert(t('error'), err.message || t('failedToFetchRequests'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]); // Depend on t for translation updates

  useEffect(() => {
    fetchRedemptionRequests();
  }, [fetchRedemptionRequests]); // Fetch requests on component mount and when fetchRedemptionRequests changes

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRedemptionRequests();
  }, [fetchRedemptionRequests]);

  const generateRechargeCode = (service: 'NCELL' | 'NTC') => {
    const random = Math.floor(100000 + Math.random() * 900000).toString();
    return `${service}-${random}`;
  };

  const updateRequestStatus = async (id: string, newStatus: 'Approved' | 'Rejected', rechargeCode?: string) => {
    try {
      const response = await fetch(`${API_URL}/api/redemption-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, rechargeCode }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(t('success'), data.message || t('requestUpdatedSuccessfully'));
        fetchRedemptionRequests(); // Re-fetch all requests to update the UI
      } else {
        throw new Error(data.message || t('failedToUpdateRequest'));
      }
    } catch (err: any) {
      console.error('Error updating request:', err);
      Alert.alert(t('error'), err.message || t('errorUpdatingRequest'));
    }
  };

  const approveRequest = (item: RedemptionRequest) => {
    let rechargeCode: string | undefined;
    if (item.service === 'NCELL' || item.service === 'NTC') {
      rechargeCode = generateRechargeCode(item.service);
    }

    Alert.alert(
      t('confirmApproval'),
      t('approveRequestConfirmation', { userName: item.userName, points: item.points, service: item.service }),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('approve'),
          onPress: () => updateRequestStatus(item._id, 'Approved', rechargeCode),
        },
      ]
    );
  };

  const rejectRequest = (item: RedemptionRequest) => {
    Alert.alert(
      t('confirmRejection'),
      t('rejectRequestConfirmation', { userName: item.userName, service: item.service }),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('reject'),
          onPress: () => updateRequestStatus(item._id, 'Rejected'),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: RedemptionRequest }) => (
    <View style={styles.card}>
      <Text style={styles.user}>{t('user')}: {item.userName}</Text>
      <Text style={styles.label}>{t('service')}: {item.service}</Text>
      {item.phoneNumber && <Text style={styles.label}>{t('phone')}: {item.phoneNumber}</Text>}
      <Text style={styles.label}>{t('points')}: {item.points}</Text>
      <Text style={styles.label}>{t('requestedAt')}: {new Date(item.requestedAt).toLocaleDateString()}</Text>
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
        {t('status')}: {t(item.status.toLowerCase())}
      </Text>

      {item.rechargeCode && (
        <Text style={styles.rechargeCode}>{t('rechargeCode')}: {item.rechargeCode}</Text>
      )}

      {item.status === 'Pending' && (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => approveRequest(item)}
          >
            <Text style={styles.btnText}>{t('approve')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => rejectRequest(item)}
          >
            <Text style={styles.btnText}>{t('reject')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>{t('loadingRequests')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRedemptionRequests}>
          <Text style={styles.retryButtonText}>{t('tryAgain')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noRequestsText}>{t('noPendingRedemptionRequests')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRedemptionRequests}>
          <Text style={styles.retryButtonText}>{t('refresh')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('pointsRedemptionRequests')}</Text>
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={item => item._id} // Use _id as key
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007BFF']}
            tintColor={'#007BFF'}
          />
        }
      />
    </View>
  );
};

export default PointsRedemptionScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F4F4F4',
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  noRequestsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 6,
    flex: 0.48,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});