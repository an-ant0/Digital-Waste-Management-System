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
  ActivityIndicator, // Import ActivityIndicator for loading state
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../config';


const FeedbackScreen: React.FC = () => {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false); // New state for loading indicator

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('Feedback') });
  }, [navigation, t]);

  const handleSubmit = async () => { // Make handleSubmit async
    if (feedback.trim().length < 10) {
      Alert.alert(t('validationTitle'), t('feedbackTooShort'));
      return;
    }

    setLoading(true); // Set loading to true when submission starts

    try {
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // You might include an Authorization header here if your API requires a token
          // 'Authorization': `Bearer ${yourAuthToken}`
        },
        body: JSON.stringify({
          feedbackText: feedback,
          // If you have userId available from authentication context, send it here:
          // userId: 'someUserIdFromContext',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(t('feedbackSentTitle'), data.message || t('thankYouFeedback'));
        setFeedback(''); // Clear feedback on success
      } else {
        // Handle API errors (e.g., server validation errors)
        Alert.alert('Submission Failed', data.message || 'An unexpected error occurred.');
        console.error('Backend Error:', data);
      }
    } catch (error) {
      // Handle network errors
      console.error('Network or other error during feedback submission:', error);
      Alert.alert('Error', 'Could not submit feedback. Please check your network connection.');
    } finally {
      setLoading(false); // Always set loading to false when submission finishes
    }
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
        editable={!loading} // Disable input while loading
      />
      <TouchableOpacity
        style={[styles.button, (feedback.trim().length < 10 || loading) && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={feedback.trim().length < 10 || loading} // Disable button while loading
      >
        {loading ? (
          <ActivityIndicator color="#fff" /> // Show loader inside button
        ) : (
          <Text style={styles.buttonText}>{t('submitFeedback')}</Text>
        )}
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