import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';

// Match the interface to the data returned by your backend
interface Truck {
  _id?: string;
  truckId: string; // This field is required by the backend
  driverName: string;
  plateNumber: string;
  route: string;
}

const TruckManagementScreen: React.FC = () => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [truckId, setTruckId] = useState(''); // New state for truckId
  const [driverName, setDriverName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [route, setRoute] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to fetch trucks from the backend API
  const fetchTrucks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/trucks`);
      if (response.data && Array.isArray(response.data)) {
        setTrucks(response.data);
      } else {
        setTrucks([]);
        Alert.alert('Error', 'Unexpected data format from the server.');
      }
    } catch (err: any) {
      console.error('Error fetching trucks:', err);
      Alert.alert(
        'Error',
        `Failed to fetch trucks: ${err.message}. Please ensure the backend is running.`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const resetForm = () => {
    setTruckId(''); // Reset truckId state
    setDriverName('');
    setPlateNumber('');
    setRoute('');
    setEditingTruck(null);
  };

  const openEditModal = (truck: Truck) => {
    setEditingTruck(truck);
    setTruckId(truck.truckId);
    setDriverName(truck.driverName);
    setPlateNumber(truck.plateNumber);
    setRoute(truck.route);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
    Keyboard.dismiss();
  };

  const handleSave = async () => {
    // Corrected validation to include truckId
    if (!truckId || !driverName || !plateNumber || !route) {
      Alert.alert('All fields are required.');
      return;
    }

    const truckData = { truckId, driverName, plateNumber, route };

    try {
      if (editingTruck) {
        // Corrected: Use the editingTruck's _id for PUT request
        await axios.put(
          `${API_URL}/api/trucks/${editingTruck._id}`,
          truckData,
        );
        Alert.alert('Success', 'Truck updated successfully.');
      } else {
        // Use POST request for adding a new truck
        await axios.post(`${API_URL}/api/trucks`, truckData);
        Alert.alert('Success', 'New truck added successfully.');
      }
      closeModal();
      fetchTrucks(); // Refresh the list of trucks
    } catch (err: any) {
      console.error('Error saving truck:', err);
      Alert.alert('Error', `Failed to save truck: ${err.message}`);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this truck?',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/api/trucks/${id}`);
              Alert.alert('Success', 'Truck deleted successfully.');
              fetchTrucks();
            } catch (err: any) {
              console.error('Error deleting truck:', err);
              Alert.alert('Error', `Failed to delete truck: ${err.message}`);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Truck }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Truck ID: {item.truckId}</Text>
      <Text style={styles.text}>Driver: {item.driverName}</Text>
      <Text style={styles.text}>Plate: {item.plateNumber}</Text>
      <Text style={styles.text}>Route: {item.route}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => openEditModal(item)}
          style={styles.editBtn}
        >
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item._id!)}
          style={styles.deleteBtn}
        >
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Truck Management</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={trucks}
          keyExtractor={item => item._id!}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>No trucks found.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>+ Add Truck</Text>
      </TouchableOpacity>

      {/* Modal for adding/editing trucks */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.modalHeader}>
              {editingTruck ? 'Edit Truck' : 'Add New Truck'}
            </Text>
            <TextInput
              placeholder="Truck ID (e.g., T-001)"
              style={styles.input}
              value={truckId}
              onChangeText={setTruckId}
              autoCapitalize="characters"
              returnKeyType="next"
              editable={!editingTruck} // Prevent editing the truckId for existing trucks
            />
            <TextInput
              placeholder="Driver Name"
              style={styles.input}
              value={driverName}
              onChangeText={setDriverName}
              autoCapitalize="words"
              returnKeyType="next"
            />
            <TextInput
              placeholder="Plate Number"
              style={styles.input}
              value={plateNumber}
              onChangeText={setPlateNumber}
              autoCapitalize="characters"
              returnKeyType="next"
            />
            <TextInput
              placeholder="Route / Area Covered"
              style={styles.input}
              value={route}
              onChangeText={setRoute}
              autoCapitalize="words"
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[
                styles.saveBtn,
                (!truckId || !driverName || !plateNumber || !route) && {
                  opacity: 0.5,
                },
              ]}
              onPress={handleSave}
              disabled={!truckId || !driverName || !plateNumber || !route}
            >
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default TruckManagementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9F9F9',
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
    marginBottom: 12,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  text: {
    fontSize: 14,
    color: '#555',
    marginVertical: 2,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  editBtn: {
    backgroundColor: '#1E90FF',
    padding: 8,
    borderRadius: 6,
    flex: 0.48,
  },
  deleteBtn: {
    backgroundColor: '#FF4C4C',
    padding: 8,
    borderRadius: 6,
    flex: 0.48,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 30,
    position: 'absolute',
    right: 20,
    bottom: 30,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: '#1E90FF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  cancelBtn: {
    backgroundColor: '#888',
    padding: 12,
    borderRadius: 6,
  },
});
