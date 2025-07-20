import React, { useState, useLayoutEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../navigation/types';

type HistoryItem = {
  id: string;
  type:
    | 'reported'
    | 'approved'
    | 'pending'
    | 'canceled'
    | 'reward_collected'
    | 'reward_redeemed';
  title: string;
  date: string;
  description: string;
};

const historyData: HistoryItem[] = [
  // ... your data here ...
];

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const HistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'History'>>();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('rewardHistory') });
  }, [navigation, t]);

  const filterOptions = [
    { label: t('all'), value: 'all' },
    { label: t('reported'), value: 'reported' },
    { label: t('approved'), value: 'approved' },
    { label: t('pending'), value: 'pending' },
    { label: t('canceled'), value: 'canceled' },
    { label: t('collected'), value: 'reward_collected' },
    { label: t('redeemed'), value: 'reward_redeemed' },
  ];

  const filteredData = useMemo(() => {
    return historyData.filter(item => {
      const matchType = selectedFilter === 'all' || item.type === selectedFilter;
      const title = t(item.title).toLowerCase();
      const desc = t(item.description).toLowerCase();
      const matchSearch =
        title.includes(searchText.toLowerCase()) ||
        desc.includes(searchText.toLowerCase());
      return matchType && matchSearch;
    });
  }, [selectedFilter, searchText, t]);

  const handleClearFilter = () => {
    setSelectedFilter('all');
    setSearchText('');
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{t(item.title)}</Text>
      <Text style={styles.date}>{formatDate(item.date)}</Text>
      <Text style={styles.description}>{t(item.description)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder={t('searchHistory')}
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
        accessibilityLabel={t('searchHistory')}
      />

      <View style={styles.filterRow}>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            placeholder={{ label: t('selectFilter'), value: null }}
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
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearFilter}
          accessibilityLabel={t('clear')}
        >
          <Text style={styles.clearButtonText}>{t('clear')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
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
