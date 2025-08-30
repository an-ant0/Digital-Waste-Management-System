import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity, // <--- ADDED THIS LINE
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { API_URL } from '../config';


// Define the type for route parameters
type RewardHistoryScreenRouteProp = RouteProp<RootStackParamList, 'RewardHistory'>;

// Define the structure of a reward history item from the backend
interface RewardHistoryItem {
  _id: string; // MongoDB's default ID field
  userId: string;
  transactionType: 'earned' | 'redeemed'; // Renamed 'type' to 'transactionType' for clarity
  points: number;
  date: string; // ISO date string from backend
  description: string;
  // You might add more fields like:
  // relatedReportId?: string;
  // relatedRewardId?: string;
}

const RewardHistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<RewardHistoryScreenRouteProp>();
  const { userId } = route.params; // Get userId from route parameters

  const [rewardHistory, setRewardHistory] = useState<RewardHistoryItem[]>([]);
  const [totalEarnedPoints, setTotalEarnedPoints] = useState(0);
  const [totalRedeemedPoints, setTotalRedeemedPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh

  // Function to fetch reward history from the backend
  const fetchRewardHistory = useCallback(async () => {
    if (!userId) {
      setError(t('userIdNotFound'));
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/reward-history`);
      const data = await response.json();

      if (response.ok) {
        setRewardHistory(data);

        // Calculate totals from the fetched data
        const earned = data
          .filter((item: RewardHistoryItem) => item.transactionType === 'earned')
          .reduce((sum: number, item: RewardHistoryItem) => sum + item.points, 0);

        const redeemed = data
          .filter((item: RewardHistoryItem) => item.transactionType === 'redeemed')
          .reduce((sum: number, item: RewardHistoryItem) => sum + item.points, 0);

        setTotalEarnedPoints(earned);
        setTotalRedeemedPoints(redeemed);
      } else {
        throw new Error(data.message || t('failedToLoadHistory'));
      }
    } catch (err: any) {
      console.error('Failed to fetch reward history:', err);
      setError(err.message || t('networkErrorMessage'));
      Alert.alert(t('error'), err.message || t('failedToFetchHistory'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, t]); // Depend on userId and translation function

  useEffect(() => {
    fetchRewardHistory();
  }, [fetchRewardHistory]); // Fetch history on component mount and when fetchRewardHistory changes

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRewardHistory();
  }, [fetchRewardHistory]);

  const renderItem = ({ item }: { item: RewardHistoryItem }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons
          name={item.transactionType === 'earned' ? 'arrow-up-circle' : 'arrow-down-circle'}
          size={20}
          color={item.transactionType === 'earned' ? '#28a745' : '#dc3545'}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.type, item.transactionType === 'earned' ? styles.earnedText : styles.redeemedText]}>
          {item.transactionType === 'earned' ? t('pointsEarned') : t('pointsRedeemed')}
        </Text>
      </View>
      <Text style={styles.points}>{item.points} {t('points')}</Text>
      <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text> {/* Format date */}
      <Text style={styles.description}>{t(item.description) || item.description}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>{t('loadingHistory')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRewardHistory}>
          <Text style={styles.retryButtonText}>{t('tryAgain')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (rewardHistory.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noHistoryText}>{t('noRewardHistory')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRewardHistory}>
          <Text style={styles.retryButtonText}>{t('refresh')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View>
            <Text style={styles.heading}>{t('rewardHistoryTitle')}</Text> {/* Updated heading text */}
            <View style={styles.summaryContainer}>
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>{t('totalEarned')}</Text>
                <Text style={[styles.totalPoints, { color: '#28a745' }]}>{totalEarnedPoints} {t('points')}</Text>
              </View>
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>{t('totalRedeemed')}</Text>
                <Text style={[styles.totalPoints, { color: '#dc3545' }]}>{totalRedeemedPoints} {t('points')}</Text>
              </View>
            </View>
          </View>
        }
        data={rewardHistory}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={{ paddingBottom: 80 }}
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

export default RewardHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F4F6F8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
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
  noHistoryText: {
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
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalBox: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    width: '48%', // Adjusted to fit two boxes
    elevation: 2,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  totalPoints: {
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  type: {
    fontSize: 14,
    fontWeight: '600',
  },
  earnedText: {
    color: '#28a745',
  },
  redeemedText: {
    color: '#dc3545',
  },
  points: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginTop: 6,
  },
});