import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, NavigationProp, DrawerActions } from '@react-navigation/native'; // Import DrawerActions
import { RootStackParamList } from '../navigation/types';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_URL } from '../config';

// Define the type for a single feedback item
interface FeedbackItem {
  _id: string; // MongoDB's default ID field
  userId?: string; // Optional: if you store user IDs with feedback
  feedbackText: string;
  timestamp: string; // ISO 8601 date string
}

type AdminFeedbackScreenNavigationProp = NavigationProp<RootStackParamList, 'AdminFeedback'>;

const AdminFeedbackScreen: React.FC = () => {
  const navigation = useNavigation<AdminFeedbackScreenNavigationProp>();
  const { t, i18n } = useTranslation();

  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Set header options
  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('userFeedback'),
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())} // Changed to openDrawer
          style={{ marginLeft: 16 }}
          accessibilityLabel={t('openMenu')} // Changed accessibility label
        >
          <Icon name="menu" size={26} color="#000" /> {/* Changed icon to "menu" */}
        </TouchableOpacity>
      ),
    });
  }, [navigation, t]);

  // Function to fetch feedback from the backend
  const fetchFeedback = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/feedback/all`);
      const data = await response.json();

      if (response.ok) {
        setFeedbackList(data);
      } else {
        setError(data.message || 'Failed to fetch feedback.');
        Alert.alert('Error', data.message || 'Failed to fetch feedback.');
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Network error or server unreachable. Please try again.');
      Alert.alert('Error', 'Could not connect to the server. Please check your network.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch feedback on component mount
  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Render a single feedback item
  const renderFeedbackItem = ({ item }: { item: FeedbackItem }) => (
    <View style={styles.feedbackCard}>
      <Text style={styles.feedbackText}>{item.feedbackText}</Text>
      <Text style={styles.feedbackDate}>
        {new Date(item.timestamp).toLocaleString(i18n.language || 'en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
      {item.userId && <Text style={styles.userIdText}>User ID: {item.userId}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>{t('loadingFeedback')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchFeedback}>
          <Text style={styles.retryButtonText}>{t('tryAgain')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (feedbackList.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noFeedbackText}>{t('noFeedbackYet')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchFeedback}>
          <Text style={styles.retryButtonText}>{t('refresh')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={feedbackList}
        keyExtractor={(item) => item._id}
        renderItem={renderFeedbackItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchFeedback}
            colors={['#007BFF']}
            tintColor="#007BFF"
          />
        }
      />
    </View>
  );
};

export default AdminFeedbackScreen;

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
  noFeedbackText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
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
  listContent: {
    padding: 16,
  },
  feedbackCard: {
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
  feedbackText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  feedbackDate: {
    fontSize: 12,
    color: '#777',
    textAlign: 'right',
  },
  userIdText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
});
