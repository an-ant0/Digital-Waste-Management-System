import React, { useState, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

const FeedbackScreen: React.FC = () => {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState('');

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('Feedback') });
  }, [navigation, t]);

  const handleSubmit = () => {
    if (feedback.trim().length < 10) {
      Alert.alert(t('validationTitle'), t('feedbackTooShort'));
      return;
    }

    Alert.alert(t('feedbackSentTitle'), t('thankYouFeedback'));
    setFeedback('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{t('feedbackHeading')}</Text>
      <Text style={styles.label}>{t('feedbackLabel')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('feedbackPlaceholder')}
        multiline
        numberOfLines={5}
        value={feedback}
        onChangeText={setFeedback}
      />
      <TouchableOpacity
        style={[styles.button, feedback.trim().length < 10 && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={feedback.trim().length < 10}
      >
        <Text style={styles.buttonText}>{t('submitFeedback')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default FeedbackScreen;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#F9F9F9',
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#444',
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a0c4ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
