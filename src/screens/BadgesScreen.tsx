import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const BadgesScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Your Rank: Silver</Text>

      <View style={styles.section}>
        <Text style={styles.subheading}>Available Badge Levels</Text>
        {[
          { name: 'Bronze', criteria: 'Submit 5 verified reports' },
          { name: 'Silver', criteria: 'Submit 20 verified reports' },
          { name: 'Gold', criteria: 'Submit 50 verified reports' },
          { name: 'Platinum', criteria: 'Submit 100 verified reports' },
        ].map((badge, index) => (
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
