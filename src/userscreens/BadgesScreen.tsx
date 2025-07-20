import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

const badgeColors: { [key: string]: string } = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2',
};

const BadgesScreen: React.FC = () => {
  const { t } = useTranslation();

  // Replace this with actual user rank from your state or props
  const userRank = 'silver';

  const badges = [
    { name: 'bronze', criteria: t('bronzeCriteria') },
    { name: 'silver', criteria: t('silverCriteria') },
    { name: 'gold', criteria: t('goldCriteria') },
    { name: 'platinum', criteria: t('platinumCriteria') },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text
        accessibilityRole="header"
        accessibilityLabel={t('yourRank', { rank: t(userRank) })}
        style={styles.heading}
      >
        {t('yourRank', { rank: t(userRank) })}
      </Text>

      <View style={styles.section}>
        <Text style={styles.subheading}>{t('availableBadgeLevels')}</Text>
        {badges.map((badge, index) => (
          <View key={index} style={styles.badgeBox}>
            <View style={[styles.badgeIcon, { backgroundColor: badgeColors[badge.name] }]} />
            <View>
              <Text style={styles.badgeTitle}>{t(badge.name)}</Text>
              <Text style={styles.badgeCriteria}>{badge.criteria}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default BadgesScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F4F6F8',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 1,
  },
  badgeIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
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
