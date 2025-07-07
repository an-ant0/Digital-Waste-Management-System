import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

const SupportScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleEmailPress = () => {
    Linking.openURL('mailto:$(mail)');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:$(phone)');
  };

  const handleFeedbackPress = () => {
    navigation.navigate('Feedback');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Support</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Email Support:</Text>
        <TouchableOpacity onPress={handleEmailPress}>
          <Text style={styles.link}>ananttodi00@gmail.com</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleEmailPress}>
          <Text style={styles.link}>rishabkhatiwada300@gmail.com</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Phone Support:</Text>
        <TouchableOpacity onPress={handlePhonePress}>
          <Text style={styles.link}>+977 980-6053850</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePhonePress}>
          <Text style={styles.link}>+977 986-2339743</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Frequently Asked Questions (FAQ):</Text>
        <Text style={styles.faqItem}>
          Q: How do I report uncollected garbage or illegal dumping in my area?{"\n"}
          A: You can easily report waste issues by clicking on the "Report Waste" button in the app. Upload a photo, describe the issue, and confirm your location.
        </Text>
        <Text style={styles.faqItem}>
          Q: How are reward points earned and redeemed?{"\n"}
          A: You earn points when your waste report is verified by the admin. These points can be redeemed for benefits like mobile top-ups or discounts.
        </Text>
        <Text style={styles.faqItem}>
          Q: Can I track the garbage truck or see collection schedules?{"\n"}
          A: Yes, the app provides real-time truck tracking and notifies you of garbage collection schedules via SMS and app alerts.
        </Text>
      </View>

      <TouchableOpacity style={styles.feedbackButton} onPress={handleFeedbackPress}>
        <Text style={styles.feedbackButtonText}>Send Feedback</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SupportScreen;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#F9F9F9',
    flexGrow: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  link: {
    color: '#007BFF',
    fontSize: 16,
  },
  faqItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    color: '#555',
  },
  feedbackButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
