import React, { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

interface CardProps {
  id: string;
  title: string;
  value: string | number;
  description: string;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useTranslation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('home'),
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 16 }}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle-outline" size={28} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, t]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card id="wasteReported" title={t('wasteReported')} value="12" description={t('wasteReportedDesc')} />
        <Card id="verifiedReported" title={t('verifiedReported')} value="9" description={t('verifiedReportedDesc')} />
        <Card id="pointsAvailable" title={t('pointsAvailable')} value="340" description={t('pointsAvailableDesc')} />
        <Card id="redeemedPoints" title={t('redeemedPoints')} value="120" description={t('redeemedPointsDesc')} />
        <Card id="reportStatus" title={t('reportStatus')} value={t('onProcess')} description={t('reportStatusDesc')} />
        <Card id="levelBadges" title={t('levelBadges')} value="Silver" description={t('achievementLevel')} />
        <Card id="topUserRank" title={t('topUserRank')} value="#5" description={t('topRankDesc')} />
      </ScrollView>
    </View>
  );
};

const Card: React.FC<CardProps> = ({ id, title, value, description }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handlePress = () => {
    if (id === 'levelBadges') {
      navigation.navigate('Badges');
    } else if (id === 'topUserRank') {
      navigation.navigate('Leaderboard');
    }
  };

  const isClickable = id === 'levelBadges' || id === 'topUserRank';
  const showProgress = id === 'levelBadges' || id === 'topUserRank';

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
            progress={0.65}
            width={null}
            height={10}
            borderRadius={5}
            color="#1E90FF"
            unfilledColor="#E0E0E0"
            borderWidth={0}
          />
          <Text style={styles.progressLabel}>{t('progressToGold')}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default HomeScreen;

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
