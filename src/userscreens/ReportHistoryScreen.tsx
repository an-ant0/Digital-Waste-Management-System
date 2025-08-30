// frontend/ReportHistoryScreen.tsx
import React, {
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import { API_URL } from '../config'; 



interface WasteReport {
  _id: string;
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
}

type HistoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ReportHistory'
>;
type HistoryScreenRouteProp = RouteProp<RootStackParamList, 'ReportHistory'>;

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const HistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const route = useRoute<HistoryScreenRouteProp>();

  const [reports, setReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('reportHistory') });
  }, [navigation, t]);

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) setUserId(storedUserId);
      else setError('User not logged in. Cannot fetch history.');
    };
    fetchUserId();
  }, []);

  const fetchReports = useCallback(async () => {
    if (!userId) return setLoading(false);

    setRefreshing(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/reports/user/${userId}`);
      const data = await response.json();

      if (response.ok) setReports(data);
      else {
        setError(data.message || 'Failed to fetch reports.');
        Alert.alert('Error', data.message || 'Failed to fetch reports.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please check your connection.');
      Alert.alert('Error', 'Could not connect to the server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchReports();
  }, [userId, fetchReports]);

  const filteredReports = reports.filter(report => {
    const matchesFilter =
      selectedFilter === 'all' ||
      report.status.toLowerCase() === selectedFilter.toLowerCase();
    const matchesSearch =
      report.description.toLowerCase().includes(searchText.toLowerCase()) ||
      report.wasteType.toLowerCase().includes(searchText.toLowerCase()) ||
      report.location.address.toLowerCase().includes(searchText.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusStyle = (status: WasteReport['status']) => {
    switch (status) {
      case 'Approved':
        return styles.statusApproved;
      case 'Rejected':
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };

  const renderItem = ({ item }: { item: WasteReport }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.wasteType}</Text>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      )}
      <Text style={styles.cardDescription}>{item.description}</Text>
      <Text style={styles.cardMeta}>
        {t('location')}: {item.location.address}
      </Text>
      <Text style={styles.cardMeta}>
        {t('submittedOn')}: {formatDate(item.createdAt)}
      </Text>
      <Text style={[styles.cardStatus, getStatusStyle(item.status)]}>
        {t('status')}: {t(item.status.toLowerCase())}
      </Text>
    </View>
  );

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>{t('loadingReports')}</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchReports}>
          <Text style={styles.retryButtonText}>{t('tryAgain')}</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={t('searchReports')}
        value={searchText}
        onChangeText={setSearchText}
      />

      <View style={styles.filterRow}>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={(value: string | null) =>
              setSelectedFilter(value || 'all')
            }
            items={[
              { label: t('all'), value: 'all' },
              { label: t('pending'), value: 'pending' },
              { label: t('approved'), value: 'approved' },
              { label: t('rejected'), value: 'rejected' },
            ]}
            value={selectedFilter}
            style={pickerSelectStyles}
            placeholder={{ label: t('selectStatus'), value: null }}
          />
        </View>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            setSelectedFilter('all');
            setSearchText('');
          }}
        >
          <Text style={styles.clearButtonText}>{t('clearFilters')}</Text>
        </TouchableOpacity>
      </View>

      {filteredReports.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.noReportsText}>{t('noReportsFound')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchReports}
              colors={['#007BFF']}
              tintColor="#007BFF"
            />
          }
        />
      )}
    </View>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
    padding: 20,
  },
  loadingText: { marginTop: 10, fontSize: 16, color: '#555' },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  noReportsText: { fontSize: 16, color: '#888', textAlign: 'center' },
  retryButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  searchInput: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 14,
    color: '#333',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  pickerContainer: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    height: 40,
  },
  clearButton: {
    backgroundColor: '#DC3545',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  clearButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
    color: '#333',
  },
  cardDescription: { fontSize: 14, color: '#555', marginBottom: 8 },
  cardMeta: { fontSize: 12, color: '#777', marginBottom: 3 },
  cardStatus: { fontSize: 14, fontWeight: '600', marginTop: 5 },
  statusPending: { color: '#FFA500' },
  statusApproved: { color: '#28a745' },
  statusRejected: { color: '#DC3545' },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: '#333',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#333',
    paddingRight: 30,
  },
});
