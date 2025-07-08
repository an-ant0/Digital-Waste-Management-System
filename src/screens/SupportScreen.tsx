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
import { useTranslation } from 'react-i18next';

const SupportScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  navigation.setOptions({ title: t('support') });

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleFeedbackPress = () => {
    navigation.navigate('Feedback');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{t('support')}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>{t('emailSupport')}</Text>
        <TouchableOpacity onPress={() => handleEmailPress('ananttodi00@gmail.com')}>
          <Text style={styles.link}>ananttodi00@gmail.com</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEmailPress('rishabkhatiwada300@gmail.com')}>
          <Text style={styles.link}>rishabkhatiwada300@gmail.com</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t('phoneSupport')}</Text>
        <TouchableOpacity onPress={() => handlePhonePress('+9779806053850')}>
          <Text style={styles.link}>+977 980-6053850</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePhonePress('+9779862339743')}>
          <Text style={styles.link}>+977 986-2339743</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t('faq')}</Text>
        <Text style={styles.faqItem}>{t('faq1')}</Text>
        <Text style={styles.faqItem}>{t('faq2')}</Text>
        <Text style={styles.faqItem}>{t('faq3')}</Text>
      </View>

      <TouchableOpacity style={styles.feedbackButton} onPress={handleFeedbackPress}>
        <Text style={styles.feedbackButtonText}>{t('sendFeedback')}</Text>
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
