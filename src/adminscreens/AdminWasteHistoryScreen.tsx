// src/screens/AdminWasteHistoryScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const dummyData = [
  { id: '1', type: 'Illegal dumping', status: 'Approved' },
  { id: '2', type: 'Medical waste', status: 'Rejected' },
];

const AdminWasteHistoryScreen: React.FC = () => {
  const getStatusStyle = (status: string) => {
    return status === 'Approved' ? styles.approved : styles.rejected;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Review History</Text>
      <FlatList
        data={dummyData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>Type: {item.type}</Text>
            <Text style={[styles.text, getStatusStyle(item.status)]}>
              Status: {item.status}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default AdminWasteHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  card: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  text: {
    fontSize: 16,
  },
  approved: {
    color: 'green',
    fontWeight: '600',
  },
  rejected: {
    color: 'red',
    fontWeight: '600',
  },
});
