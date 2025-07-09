import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

const BadgesScreen: React.FC = () => {
  const { t } = useTranslation();

  const badges = [
    { name: t('bronze'), criteria: t('bronzeCriteria') },
    { name: t('silver'), criteria: t('silverCriteria') },
    { name: t('gold'), criteria: t('goldCriteria') },
    { name: t('platinum'), criteria: t('platinumCriteria') },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>{t('yourRank', { rank: t('silver') })}</Text>

      <View style={styles.section}>
        <Text style={styles.subheading}>{t('availableBadgeLevels')}</Text>
        {badges.map((badge, index) => (
          <View key={index} style={styles.badgeBox}>
            <Text style={styles.badgeTitle}>{badge.name}</Text>
            <Text style={styles.badgeCriteria}>{badge.criteria}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default BadgesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    padding: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginTop: 10,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1E90FF',
  },
  badgeBox: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 1,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#555',
  },
  badgeCriteria: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
});
