// frontend/AdminWasteReviewScreen.tsx
import React, { useEffect, useState, useLayoutEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
  TouchableWithoutFeedback, // <-- ADD THIS LINE
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types'; // Make sure this path is correct
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';


interface WasteReport {
  _id: string; // MongoDB's default ID field
  userId?: string; // Optional: if you store user IDs with reports
  wasteType: string;
  description: string;
  imageUrl: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string; // ID of the admin who reviewed it
  reviewedAt?: string; // Timestamp of review
  userName?: string; // Added for displaying in the list
}

// Update the navigation prop type to include navigation to AdminWasteHistory
type AdminWasteReviewScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AdminWasteReview'
>;

const AdminWasteReviewScreen: React.FC = () => {
  const navigation = useNavigation<AdminWasteReviewScreenNavigationProp>();
  const { t } = useTranslation();

  const [pendingReports, setPendingReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const fetchPendingReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
  // Use API_URL from config
  const response = await fetch(`${API_URL}/reports/pending`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPendingReports(data);
    } catch (err: any) {
      console.error('Failed to fetch pending reports:', err);
      setError(err.message || t('failedToLoadReports'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPendingReports();
  }, [fetchPendingReports]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPendingReports();
  }, [fetchPendingReports]);

  // Use useLayoutEffect to set header options, including the new history button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('wasteReview'),
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={{ marginLeft: 10 }}
        >
          <Icon name="menu" size={24} color="#000" />
        </TouchableOpacity>
      ),
      // --- ADD THIS SECTION FOR THE HISTORY BUTTON ---
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('AdminWasteHistory')} // Navigate to the history screen
          style={{ marginRight: 10, flexDirection: 'row', alignItems: 'center' }}
        >
          <Icon name="history" size={24} color="#000" />
          {/* <Text style={{ color: '#000', marginLeft: 4, fontSize: 16 }}>{t('history')}</Text> */}
        </TouchableOpacity>
      ),
      // --- END ADDITION ---
    });
  }, [navigation, t]);

  const handleReview = async (reportId: string, status: 'Approved' | 'Rejected') => {
    Alert.alert(
      t('confirmReview'),
      t(status === 'Approved' ? 'approveConfirmation' : 'rejectConfirmation'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('confirm'),
          onPress: async () => {
            try {
              // Simulate an admin user ID for now
              const adminId = 'admin_user_id_example'; // Replace with actual admin user ID from auth
              // Use API_URL from config
              const response = await fetch(`${API_URL}/reports/${reportId}/review`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status, reviewedBy: adminId }),
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              // Filter out the reviewed report from the pending reports state
              setPendingReports((prevReports) =>
                prevReports.filter((report) => report._id !== reportId),
              );
              Alert.alert(
                t('success'),
                t(status === 'Approved' ? 'reportApproved' : 'reportRejected'),
              );
            } catch (err: any) {
              console.error('Failed to update report status:', err);
              Alert.alert(t('error'), err.message || t('failedToUpdateStatus'));
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const renderItem = ({ item }: { item: WasteReport }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setSelectedImage(item.imageUrl)} style={styles.imageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        <Text style={styles.viewImageText}>{t('viewImage')}</Text>
      </TouchableOpacity>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{t('wasteType')}: {item.wasteType}</Text>
        <Text style={styles.description}>{t('description')}: {item.description}</Text>
        <Text style={styles.meta}>{t('location')}: {item.location.address}</Text>
        <Text style={styles.meta}>{t('reportedOn')}: {new Date(item.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.statusPending}>{t('status')}: {t(item.status.toLowerCase())}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.approveBtn} onPress={() => handleReview(item._id, 'Approved')}>
            <Text style={styles.btnText}>{t('approve')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReview(item._id, 'Rejected')}>
            <Text style={styles.btnText}>{t('reject')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && pendingReports.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>{t('loadingReports')}...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchPendingReports} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>{t('retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {pendingReports.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.noReportsContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.noReportsText}>{t('noPendingReports')}</Text>
          <Text style={styles.noReportsText}>{t('pullToRefresh')}</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={pendingReports}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Image Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible || !!selectedImage} // Use !!selectedImage to check if a non-empty string is present
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedImage(''); // Clear selected image on close
        }}
      >
        <TouchableWithoutFeedback onPress={() => { setModalVisible(false); setSelectedImage(''); }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <ScrollView contentContainerStyle={styles.modalScrollContent}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>{t('wasteImage')}</Text>
                  {selectedImage ? (
                    <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />
                  ) : (
                    <Text>{t('noImageAvailable')}</Text>
                  )}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => { setModalVisible(false); setSelectedImage(''); }}
                  >
                    <Text style={styles.closeButtonText}>{t('close')}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  noReportsContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    overflow: 'hidden', // Ensures image rounded corners are respected
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#e0e0e0', // Placeholder background
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  viewImageText: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    fontSize: 12,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  meta: {
    fontSize: 13,
    color: '#777',
    marginBottom: 3,
  },
  statusPending: {
    color: '#FFC107', // Amber for pending
    marginVertical: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  approveBtn: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 6,
    flex: 0.48,
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: '#DC3545',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
    resizeMode: 'contain', // Changed to contain for full image visibility
  },
  modalText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminWasteReviewScreen;