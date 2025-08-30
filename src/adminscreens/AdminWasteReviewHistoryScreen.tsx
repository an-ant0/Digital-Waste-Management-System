import React, {
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Removed DrawerActions as it's not needed here
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_URL } from '../config';

interface WasteReport {
  _id: string;
  userId?: string;
  wasteType: string;
  description: string;
  imageUrl: string;
  location: {
    type: string;
    coordinates: [number, number];
    address: string;
  };
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

type AdminWasteReviewHistoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AdminWasteHistory'
>;

const AdminWasteReviewHistoryScreen: React.FC = () => {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const navigation =
    useNavigation<AdminWasteReviewHistoryScreenNavigationProp>();
  const { t } = useTranslation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('reviewHistory'), // Use headerTitle for consistency with other screens
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()} // <-- Changed to goBack() for back navigation
          style={{ marginLeft: 10 }} // Adjusted margin for typical back button placement
        >
          <Icon name="arrow-back" size={24} color="#000" />{' '}
          {/* Changed icon to "arrow-back" */}
        </TouchableOpacity>
      ),
      // No headerRight needed here unless you want another button
    });
  }, [navigation, t]);

  const fetchReviewedReports = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/reports/reviewed`);
      const data = await response.json(); // <-- THIS LINE SHOULD BE SEPARATE

      if (response.ok) {
        setReports(data);
      } else {
        setError(data.message || t('failedToLoadReviewedReports'));
        Alert.alert(t('error'), data.message || t('failedToFetchReports'));
      }
    } catch (err: any) {
      console.error('Network Error:', err);
      setError(t('networkError') + (err.message || ''));
      Alert.alert(t('error'), t('networkErrorMessage'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchReviewedReports();
  }, [fetchReviewedReports]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Approved':
        return styles.statusApproved;
      case 'Rejected':
        return styles.statusRejected;
      default:
        return styles.statusDefault; // Fallback
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric', // Included day for completeness
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderReportItem = ({ item }: { item: WasteReport }) => (
    <View style={styles.card}>
      <Text style={styles.type}>
        {t('wasteType')}: {item.wasteType}
      </Text>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      )}
      <Text style={styles.description}>
        {t('description')}: {item.description}
      </Text>
      <Text style={styles.meta}>
        {t('location')}: {item.location.address}
      </Text>
      <Text style={styles.meta}>
        {t('submittedOn')}: {formatDate(item.createdAt)}
      </Text>
      {item.reviewedAt && (
        <Text style={styles.meta}>
          {t('reviewedOn')}: {formatDate(item.reviewedAt)}
        </Text>
      )}
      <Text style={[styles.status, getStatusStyle(item.status)]}>
        {t('status')}: {t(item.status.toLowerCase())}
      </Text>
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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchReviewedReports}
        >
          <Text style={styles.retryButtonText}>{t('tryAgain')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (reports.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noReportsText}>{t('noReviewedReports')}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchReviewedReports}
        >
          <Text style={styles.retryButtonText}>{t('refresh')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={item => item._id}
        renderItem={renderReportItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchReviewedReports}
            colors={['#007BFF']}
            tintColor="#007BFF"
          />
        }
      />
    </View>
  );
};

export default AdminWasteReviewHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  noReportsText: {
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
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  type: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    color: '#555',
    marginBottom: 6,
    fontSize: 14,
  },
  meta: {
    fontSize: 13,
    color: '#777',
    marginBottom: 3,
  },
  status: {
    marginVertical: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  statusApproved: {
    color: '#28a745', // Green
  },
  statusRejected: {
    color: '#DC3545', // Red
  },
  statusDefault: {
    color: '#555', // Fallback color
  },
});
