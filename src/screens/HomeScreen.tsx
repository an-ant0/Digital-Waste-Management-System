import React, { useLayoutEffect } from 'react';
import * as Progress from 'react-native-progress';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Badges: undefined;
  Leaderboard: undefined;
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Home',
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 16 }}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle-outline" size={28} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card title="Waste Reported" value="12" description="Reports you’ve submitted" />
        <Card title="Verified Reported" value="9" description="Reports verified by authority" />
        <Card title="Points Available" value="340" description="Your reward points" />
        <Card title="Redeemed Points" value="120" description="Points you’ve used" />
        <Card title="Current Report Status" value="On Process" description="Latest report status" />
        <Card title="Level / Badges" value="Silver" description="Your achievement level" />
        <Card title="Top User Rank" value="#5" description="You're among the top waste reporters" />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

type CardProps = {
  title: string;
  value: string | number;
  description: string;
};

const Card: React.FC<CardProps> = ({ title, value, description }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handlePress = () => {
    if (title === 'Level / Badges') {
      navigation.navigate('Badges');
    } else if (title === 'Top User Rank') {
      navigation.navigate('Leaderboard');
    }
  };

  const isClickable = title === 'Level / Badges' || title === 'Top User Rank';
  const showProgress = title === 'Level / Badges' || title === 'Top User Rank';

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!isClickable}
      style={[styles.card, isClickable && styles.clickableCard]}
      activeOpacity={isClickable ? 0.8 : 1}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardDesc}>{description}</Text>

      {showProgress && (
        <View style={styles.progressContainer}>
          <Progress.Bar
            progress={0.65} // You can dynamically calculate progress here
            width={null}
            height={10}
            borderRadius={5}
            color="#1E90FF"
            unfilledColor="#E0E0E0"
            borderWidth={0}
          />
          <Text style={styles.progressLabel}>65% to Gold Level</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  clickableCard: {
    borderColor: '#1E90FF',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
  },
});
