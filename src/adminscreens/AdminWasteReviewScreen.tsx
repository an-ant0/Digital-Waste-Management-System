import React, { useEffect, useState, useLayoutEffect } from 'react';
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
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types'; // Adjust path if needed

interface WasteReport {
  id: string;
  wasteType: string;
  description: string;
  imageUrl: string;
  location: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

type AdminWasteReviewScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AdminWasteReview'
>;

const AdminWasteReviewScreen: React.FC = () => {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation<AdminWasteReviewScreenNavigationProp>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('AdminWasteHistory')}
          style={{ marginRight: 16 }}
        >
          <Icon name="history" size={26} color="#1E90FF" />
        </TouchableOpacity>
      ),
      title: 'Waste Report Review',
    });
  }, [navigation]);

  useEffect(() => {
    // Simulated data fetch
    const fetchReports = async () => {
      const dummyReports: WasteReport[] = [
        {
          id: '1',
          wasteType: 'Street litter',
          description: 'Garbage dumped on the roadside.',
          imageUrl: 'https://via.placeholder.com/200',
          location: 'Dharan, Ward-5',
          submittedAt: '2025-07-12',
          status: 'Pending',
        },
        {
          id: '2',
          wasteType: 'Illegal dumping',
          description: 'Unauthorized dumping near river bank.',
          imageUrl: 'https://via.placeholder.com/200',
          location: 'Itahari, Ward-2',
          submittedAt: '2025-07-10',
          status: 'Pending',
        },
      ];
      setReports(dummyReports);
      setLoading(false);
    };

    fetchReports();
  }, []);

  const updateStatus = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setReports(prev =>
      prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
    );
    Alert.alert(`Report ${newStatus}`, `Report has been ${newStatus.toLowerCase()}.`);
    setModalVisible(false);
  };

  const renderReportItem = ({ item }: { item: WasteReport }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <Text style={styles.type}>{item.wasteType}</Text>
      <Text numberOfLines={2} style={styles.description}>{item.description}</Text>
      <Text style={styles.meta}>{item.location}</Text>
      <Text style={styles.meta}>{item.submittedAt}</Text>
      <Text
        style={[
          styles.status,
          {
            color:
              item.status === 'Approved'
                ? 'green'
                : item.status === 'Rejected'
                ? 'red'
                : '#999',
          },
        ]}
      >
        Status: {item.status}
      </Text>

      {item.status === 'Pending' && (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => updateStatus(item.id, 'Approved')}
          >
            <Text style={styles.btnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => updateStatus(item.id, 'Rejected')}
          >
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        onPress={() => {
          setSelectedReport(item);
          setModalVisible(true);
        }}
      >
        <Text style={styles.viewDetails}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} color="#1E90FF" />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Waste Report Review</Text>
      <FlatList
        data={reports}
        keyExtractor={item => item.id}
        renderItem={renderReportItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Details Modal */}
      {selectedReport && (
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <ScrollView style={styles.modalContent}>
              <Image source={{ uri: selectedReport.imageUrl }} style={styles.modalImage} />
              <Text style={styles.modalHeading}>{selectedReport.wasteType}</Text>
              <Text style={styles.modalLabel}>Location:</Text>
              <Text style={styles.modalText}>{selectedReport.location}</Text>
              <Text style={styles.modalLabel}>Submitted At:</Text>
              <Text style={styles.modalText}>{selectedReport.submittedAt}</Text>
              <Text style={styles.modalLabel}>Description:</Text>
              <Text style={styles.modalText}>{selectedReport.description}</Text>

              {selectedReport.status === 'Pending' && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => updateStatus(selectedReport.id, 'Approved')}
                  >
                    <Text style={styles.btnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => updateStatus(selectedReport.id, 'Rejected')}
                  >
                    <Text style={styles.btnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default AdminWasteReviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9F9F9',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 6,
    marginBottom: 10,
  },
  type: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  description: {
    color: '#555',
    marginBottom: 6,
  },
  meta: {
    fontSize: 13,
    color: '#777',
  },
  status: {
    marginVertical: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
  viewDetails: {
    color: '#1E90FF',
    marginTop: 10,
    textAlign: 'right',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    maxHeight: '90%',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalLabel: {
    fontWeight: '600',
    marginTop: 10,
  },
  modalText: {
    color: '#444',
  },
  closeBtn: {
    backgroundColor: '#888',
    padding: 10,
    borderRadius: 6,
    marginTop: 16,
  },
});
