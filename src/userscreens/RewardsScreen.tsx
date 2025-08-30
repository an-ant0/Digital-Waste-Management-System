import React, {
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config'; // Import API_URL from config


interface RewardOption {
  id: string;
  title: string;
  pointsRequired: number;
  description: string;
}

const RewardsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, 'Rewards'>>();

  const [userId, setUserId] = useState<string | null>(null);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [redeemedPoints, setRedeemedPoints] = useState(0);
  const [rewards, setRewards] = useState<RewardOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReward, setSelectedReward] = useState<RewardOption | null>(
    null,
  );
  const [isModalVisible, setModalVisible] = useState(false);
  const [phone, setPhone] = useState('');

  // Fetch rewards and user points
  const fetchRewardsData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!userId) {
        console.warn('User ID not available, cannot fetch rewards data.');
        setLoading(false);
        return;
      }

      // Fetch user points
      const pointsResponse = await fetch(`${API_URL}/api/users/${userId}/points`);
      const pointsData = await pointsResponse.json();

      if (pointsResponse.ok) {
        setAvailablePoints(pointsData.availablePoints);
        setRedeemedPoints(pointsData.redeemedPoints);
      } else {
        throw new Error(pointsData.message || t('failedToLoadPoints'));
      }

      // Fetch available rewards
      const rewardsResponse = await fetch(`${API_URL}/api/rewards`);
      const rewardsData = await rewardsResponse.json();

      if (rewardsResponse.ok) {
        setRewards(rewardsData);
      } else {
        throw new Error(rewardsData.message || t('failedToLoadRewards'));
      }
    } catch (err: any) {
      console.error('Failed to fetch rewards data:', err);
      setError(err.message || t('networkErrorMessage'));
      Alert.alert(t('error'), err.message || t('failedToFetchRewardsData'));
    } finally {
      setLoading(false);
    }
  }, [userId, t]);

  // Load userId from AsyncStorage on mount
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          console.warn('User ID not found in AsyncStorage.');
          navigation.replace('UserLogin');
          setLoading(false);
          setError(t('userNotLoggedIn'));
        }
      } catch (e) {
        console.error('Failed to load user ID from AsyncStorage', e);
        setError(t('failedToLoadUserData'));
        setLoading(false);
      }
    };
    loadUserId();
  }, []);

  // Fetch rewards data when userId is available
  useEffect(() => {
    if (userId) {
      fetchRewardsData();
    }
  }, [userId, fetchRewardsData]);

  // Configure header options
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            if (userId) {
              navigation.navigate('RewardHistory', { userId });
            } else {
              Alert.alert(t('error'), t('userNotLoggedIn'));
            }
          }}
          style={{ marginRight: 16 }}
        >
          <Icon name="history" size={28} color="#1E90FF" />
        </TouchableOpacity>
      ),
      title: t('rewards'),
      headerShown: true,
    });
  }, [navigation, t, userId]);

  // Redeem reward
  const processRedemption = async (reward: RewardOption) => {
    if (!userId) {
      Alert.alert(t('error'), t('userNotLoggedIn'));
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/rewards/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          rewardId: reward.id,
          pointsRedeemed: reward.pointsRequired,
          phoneNumber: reward.title.includes('Recharge') ? phone : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAvailablePoints(prev => prev - reward.pointsRequired);
        setRedeemedPoints(prev => prev + reward.pointsRequired);
        setModalVisible(false);
        setPhone('');
        Alert.alert(t('redeemSuccess', { title: reward.title }));
      } else {
        throw new Error(data.message || t('redemptionFailed'));
      }
    } catch (err: any) {
      console.error('Redemption error:', err);
      Alert.alert(t('error'), err.message || t('redemptionFailedTryAgain'));
    }
  };

  const handleRedeemPress = (reward: RewardOption) => {
    if (availablePoints < reward.pointsRequired) {
      Alert.alert(t('notEnoughPoints'));
      return;
    }

    if (reward.title.includes('Recharge')) {
      setSelectedReward(reward);
      setModalVisible(true);
    } else {
      processRedemption(reward);
    }
  };

  const handleConfirm = () => {
    if (!phone.trim() || phone.trim().length < 10) {
      Alert.alert(t('pleaseEnterPhone'));
      return;
    }
    if (selectedReward) {
      processRedemption(selectedReward);
    }
  };

  const renderItem = ({ item }: { item: RewardOption }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons
          name="gift-outline"
          size={24}
          color="#1E90FF"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.title}>{item.title}</Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.points}>
        {t('pointsRequired')}: {item.pointsRequired}
      </Text>
      <TouchableOpacity
        style={[
          styles.redeemBtn,
          availablePoints < item.pointsRequired && { backgroundColor: '#ccc' },
        ]}
        onPress={() => handleRedeemPress(item)}
        disabled={availablePoints < item.pointsRequired}
      >
        <Text style={styles.redeemText}>{t('redeem')}</Text>
      </TouchableOpacity>
    </View>
  );

  // Conditional rendering
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>{t('loadingRewards')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRewardsData}>
          <Text style={styles.retryButtonText}>{t('tryAgain')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (rewards.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noRewardsText}>{t('noRewardsAvailable')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRewardsData}>
          <Text style={styles.retryButtonText}>{t('refresh')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('availableRewards')}</Text>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryBox}>
          <Text style={styles.label}>{t('pointsAvailable')}</Text>
          <Text style={[styles.value, { color: '#28a745' }]}>
            {availablePoints}
          </Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.label}>{t('pointsRedeemed')}</Text>
          <Text style={[styles.value, { color: '#dc3545' }]}>
            {redeemedPoints}
          </Text>
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
          <Text style={styles.modalTitle}>{t('enterPhoneNumber')}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 9800000000"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmText}>{t('next')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={{ color: '#999', marginTop: 10 }}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default RewardsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  loadingText: { marginTop: 10, fontSize: 16, color: '#555' },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  noRewardsText: { fontSize: 16, color: '#888', textAlign: 'center' },
  retryButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 16, color: '#333' },
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
  label: { fontSize: 14, color: '#666', marginBottom: 6 },
  value: { fontSize: 18, fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 16, fontWeight: '600', color: '#333' },
  description: { fontSize: 14, color: '#555', marginBottom: 8 },
  points: { fontSize: 14, color: '#999', marginBottom: 10 },
  redeemBtn: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  redeemText: { color: '#fff', fontWeight: '600', fontSize: 14 },
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
  confirmText: { color: '#fff', fontWeight: '600' },
});
