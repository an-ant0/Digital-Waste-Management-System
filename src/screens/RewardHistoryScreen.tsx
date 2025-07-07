import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

type RewardItem = {
  id: string;
  type: 'earned' | 'redeemed';
  points: number;
  date: string;
  description: string;
};

const rewardData: RewardItem[] = [
  { id: '1', type: 'earned', points: 100, date: '2025-06-28', description: 'Report verified from Ward 4' },
  { id: '2', type: 'redeemed', points: 50, date: '2025-06-26', description: 'Mobile Top-Up' },
  { id: '3', type: 'earned', points: 75, date: '2025-06-25', description: 'Extra points for 5 clean reports' },
  { id: '4', type: 'redeemed', points: 100, date: '2025-06-24', description: 'Garbage Bag Purchase' },
];

// Calculate totals
const totalEarned = rewardData
  .filter(item => item.type === 'earned')
  .reduce((sum, item) => sum + item.points, 0);

const totalRedeemed = rewardData
  .filter(item => item.type === 'redeemed')
  .reduce((sum, item) => sum + item.points, 0);

const RewardHistoryScreen: React.FC = () => {
  const renderItem = ({ item }: { item: RewardItem }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons
          name={item.type === 'earned' ? 'arrow-up-circle' : 'arrow-down-circle'}
          size={20}
          color={item.type === 'earned' ? '#28a745' : '#dc3545'}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.type, item.type === 'earned' ? styles.earnedText : styles.redeemedText]}>
          {item.type === 'earned' ? 'Points Earned' : 'Points Redeemed'}
        </Text>
      </View>
      <Text style={styles.points}>{item.points} pts</Text>
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const handleRedeemPress = () => {
    Alert.alert('Redeem Rewards', 'Redirecting to redeem rewards page...');
    // You can navigate to redeem screen here if available
  };

  return (
<View style={styles.container}>
  <FlatList
    ListHeaderComponent={
      <View>
        <Text style={styles.heading}>Your Rewards</Text>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Redeemed</Text>
            <Text style={[styles.totalPoints, { color: '#dc3545' }]}>{totalRedeemed} pts</Text>
          </View>
        </View>
    }
    data={rewardData}
    renderItem={renderItem}
    keyExtractor={item => item.id}
    contentContainerStyle={{ paddingBottom: 80 }}
  />
</View>
  )
}

export default RewardHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F4F6F8',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,

    color: '#333',
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  totalBox: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    width: '60%',
    elevation: 2,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  totalPoints: {
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  type: {
    fontSize: 14,
    fontWeight: '600',
  },
  earnedText: {
    color: '#28a745',
  },
  redeemedText: {
    color: '#dc3545',
  },
  points: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginTop: 6,
  },
});
