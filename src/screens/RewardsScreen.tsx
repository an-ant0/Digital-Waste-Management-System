import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import Ionicons from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { Alert } from 'react-native';
import { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type RewardOption = {
  id: string;
  title: string;
  pointsRequired: number;
  description: string;
};

const rewards: RewardOption[] = [
  {
    id: '1',
    title: 'Ncell Recharge Card',
    pointsRequired: 200,
    description: 'Get a Ncell top-up worth NPR 50.',
  },
  {
    id: '2',
    title: 'NTC Recharge Card',
    pointsRequired: 200,
    description: 'Get an NTC top-up worth NPR 50.',
  },
  {
    id: '3',
    title: 'Garbage Bag Pack',
    pointsRequired: 100,
    description: 'Redeem a pack of garbage bags.',
  },
];

const RewardsScreen: React.FC = () => {
  const [availablePoints, setAvailablePoints] = useState(2000);
  const [redeemedPoints, setRedeemedPoints] = useState(120);
  const [selectedReward, setSelectedReward] = useState<RewardOption | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [phone, setPhone] = useState('');

  const handleRedeemPress = (reward: RewardOption) => {
    if (availablePoints < reward.pointsRequired) {
      Alert.alert('Not enough points to redeem this reward.');
      return;
    }

    if (reward.title.includes('Recharge')) {
      setSelectedReward(reward);
      setModalVisible(true);
    } else {
      processRedemption(reward);
    }
  };

  const processRedemption = (reward: RewardOption) => {
    setAvailablePoints(prev => prev - reward.pointsRequired);
    setRedeemedPoints(prev => prev + reward.pointsRequired);
    setModalVisible(false);
    setPhone('');
    Alert.alert(`Reward "${reward.title}" redeemed successfully!`);
  };

  const handleConfirm = () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Please enter a valid phone number.');
      return;
    }
    if (selectedReward) {
      processRedemption(selectedReward);
    }
  };

const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Rewards'>>();

useLayoutEffect(() => {
  navigation.setOptions({
    headerRight: () => (
      <TouchableOpacity
        onPress={() => navigation.navigate('RewardHistory')}
        style={{ marginRight: 16 }}
      >
        <Icon name="history" size={28} color="#1E90FF" />
      </TouchableOpacity>
    ),
    title: 'Rewards',
    headerShown: true,
  });
}, [navigation]);

  const renderItem = ({ item }: { item: RewardOption }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name="gift-outline" size={24} color="#1E90FF" style={{ marginRight: 8 }} />
        <Text style={styles.title}>{item.title}</Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.points}>Points Required: {item.pointsRequired}</Text>
      <TouchableOpacity style={styles.redeemBtn} onPress={() => handleRedeemPress(item)}>
        <Text style={styles.redeemText}>Redeem</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Available Rewards</Text>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryBox}>
          <Text style={styles.label}>Points Available</Text>
          <Text style={[styles.value, { color: '#28a745' }]}>{availablePoints}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.label}>Points Redeemed</Text>
          <Text style={[styles.value, { color: '#dc3545' }]}>{redeemedPoints}</Text>
        </View>
      </View>

      <FlatList
        data={rewards}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
      />

      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Enter Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 9800000000"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Next</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={{ color: '#999', marginTop: 10 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default RewardsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryBox: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    width: '48%',
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  points: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  redeemBtn: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  redeemText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '100%',
    padding: 10,
    marginBottom: 12,
  },
  confirmBtn: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
  },
});
