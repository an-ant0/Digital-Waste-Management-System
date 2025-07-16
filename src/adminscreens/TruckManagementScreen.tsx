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
} from 'react-native';

interface Truck {
  id: string;
  driverName: string;
  plateNumber: string;
  route: string;
}

const TruckManagementScreen: React.FC = () => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [driverName, setDriverName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [route, setRoute] = useState('');

  const dispatchTruckToWard = async (wardNumber: string) => {
    try {
      await fetch('https://your-server.com/api/dispatch-truck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wardNumber }),
      });
      Alert.alert('Success', `Truck dispatched to Ward ${wardNumber}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to dispatch truck');
    }
  };


  useEffect(() => {
    // Dummy data – replace with real API call
    const dummy: Truck[] = [
      { id: '1', driverName: 'Ram Thapa', plateNumber: 'BA 2 KHA 1234', route: 'Ward 1-5' },
      { id: '2', driverName: 'Shyam Gurung', plateNumber: 'BA 4 PA 9876', route: 'Ward 6-10' },
    ];
    setTrucks(dummy);
  }, []);

  const resetForm = () => {
    setDriverName('');
    setPlateNumber('');
    setRoute('');
    setEditingTruck(null);
  };

  const openEditModal = (truck: Truck) => {
    setEditingTruck(truck);
    setDriverName(truck.driverName);
    setPlateNumber(truck.plateNumber);
    setRoute(truck.route);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!driverName || !plateNumber || !route) {
      Alert.alert('All fields are required.');
      return;
    }

    if (editingTruck) {
      setTrucks(prev =>
        prev.map(t => (t.id === editingTruck.id ? { ...editingTruck, driverName, plateNumber, route } : t))
      );
    } else {
      const newTruck: Truck = {
        id: Date.now().toString(),
        driverName,
        plateNumber,
        route,
      };
      setTrucks(prev => [...prev, newTruck]);
    }

    setModalVisible(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this truck?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setTrucks(prev => prev.filter(t => t.id !== id)),
      },
    ]);
  };

  const renderItem = ({ item }: { item: Truck }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.driverName}</Text>
      <Text style={styles.text}>Plate: {item.plateNumber}</Text>
      <Text style={styles.text}>Route: {item.route}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editBtn}>
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Truck Management</Text>

      <FlatList
        data={trucks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Truck</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalHeader}>{editingTruck ? 'Edit Truck' : 'Add New Truck'}</Text>
            <TextInput
              placeholder="Driver Name"
              style={styles.input}
              value={driverName}
              onChangeText={setDriverName}
            />
            <TextInput
              placeholder="Plate Number"
              style={styles.input}
              value={plateNumber}
              onChangeText={setPlateNumber}
            />
            <TextInput
              placeholder="Route / Area Covered"
              style={styles.input}
              value={route}
              onChangeText={setRoute}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setModalVisible(false); resetForm(); }}>
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
