import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface User {
  id: string;
  name: string;
  points: number;
  rank: number;
}

const mockTopUsers: User[] = [
  { id: '1', name: 'Suman Lama', points: 950, rank: 1 },
  { id: '2', name: 'Alisha Karki', points: 850, rank: 2 },
  { id: '3', name: 'Rohit Thapa', points: 790, rank: 3 },
  { id: '4', name: 'Anjana Gurung', points: 720, rank: 4 },
  { id: '5', name: 'Bibek Rai', points: 690, rank: 5 },
  { id: '6', name: 'Rita Tamang', points: 670, rank: 6 },
  { id: '7', name: 'Suraj Bista', points: 630, rank: 7 },
];

const LeaderboardScreen: React.FC = () => {
  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.userRow}>
      <Text style={styles.rankText}>
        {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}
      </Text>
      <View style={styles.nameContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.points}>{item.points} pts</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1E90FF" barStyle="light-content" />
      <Text style={styles.header}>🏆 Leaderboard</Text>
      <FlatList
        data={mockTopUsers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

export default LeaderboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E90FF',
    textAlign: 'center',
    marginVertical: 20,
  },
  list: {
    paddingHorizontal: 16,
  },
  userRow: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
    width: 50,
    color: '#1E90FF',
  },
  nameContainer: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  points: {
    fontSize: 14,
    color: '#888',
  },
});
