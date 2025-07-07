import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

type HistoryItem = {
  id: string;
  type: 'reported' | 'approved' | 'pending' | 'canceled' | 'reward_collected' | 'reward_redeemed';
  title: string;
  date: string;
  description: string;
};

const historyData: HistoryItem[] = [
  { id: '1', type: 'reported', title: 'Reported Waste', date: '2025-06-28', description: 'Reported from Ward 3.' },
  { id: '2', type: 'approved', title: 'Approved Waste', date: '2025-06-26', description: 'Verified by municipality.' },
  { id: '3', type: 'pending', title: 'Pending Report', date: '2025-06-25', description: 'Waiting for review.' },
  { id: '4', type: 'canceled', title: 'Canceled Report', date: '2025-06-24', description: 'Issue was invalid.' },
  { id: '5', type: 'reward_collected', title: 'Points Collected', date: '2025-06-23', description: 'Earned 50 points.' },
  { id: '6', type: 'reward_redeemed', title: 'Points Redeemed', date: '2025-06-22', description: 'Used 100 points.' },
];

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Reported', value: 'reported' },
  { label: 'Approved', value: 'approved' },
  { label: 'Pending', value: 'pending' },
  { label: 'Canceled', value: 'canceled' },
  { label: 'Collected', value: 'reward_collected' },
  { label: 'Redeemed', value: 'reward_redeemed' },
];

const HistoryScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  const filteredData = historyData.filter(item => {
    const matchType = selectedFilter === 'all' || item.type === selectedFilter;
    const matchSearch =
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase());
    return matchType && matchSearch;
  });

  const handleClearFilter = () => {
    setSelectedFilter('all');
    setSearchText('');
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search history..."
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />

      <View style={styles.filterRow}>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
              placeholder={{}} 
              items={filterOptions}
              onValueChange={(value: string) => setSelectedFilter(value)}
              value={selectedFilter}
            style={{
              inputIOS: styles.picker,
              inputAndroid: styles.picker,
            }}
            useNativeAndroidPickerStyle={false}
          />
        </View>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearFilter}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
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
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
  },
  pickerContainer: {
    flex: 1,
    marginRight: 10,
  },
  picker: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#333',
  },
  clearButton: {
    backgroundColor: '#DC3545',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },
});
