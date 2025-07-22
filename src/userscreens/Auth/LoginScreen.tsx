import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // CRITICAL: Import AsyncStorage
import axios from 'axios'; // For making API requests
import { useTranslation } from 'react-i18next';

// Assuming your RootStackParamList is correctly defined in navigation/types.ts
import { RootStackParamList } from '../../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UserLogin'>;

// Define your backend API base URL
const API_BASE_URL = 'http://192.168.1.76:5000'; // Make sure this matches your actual backend IP/port

const LoginScreen: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // State for login loading indicator
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { t } = useTranslation();

  const handleLogin = async () => {
    // Basic input validation
    if (!emailOrPhone || !password) {
      Alert.alert(t('error'), t('enterBothFields'));
      return;
    }

    setLoading(true); // Start loading
    try {
      // Make API call to your backend login endpoint
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
        emailOrPhone,
        password,
      });

      // Check if the login was successful and user data (especially _id) is returned
      if (response.data && response.data._id) {
        // --- CRITICAL PART: SAVE USER DATA TO ASYNCSTORAGE ---
        // These values MUST be saved correctly for CustomPickupScreen and other screens to retrieve them.
        await AsyncStorage.setItem('userId', response.data._id);
        // Construct userName from available name parts
        const userName = `${response.data.firstName || ''} ${response.data.middleName ? response.data.middleName + ' ' : ''}${response.data.lastName || ''}`.trim();
        await AsyncStorage.setItem('userName', userName);
        await AsyncStorage.setItem('userPhone', response.data.phone || ''); // Ensure phone is saved, default to empty string if null/undefined
        await AsyncStorage.setItem('userEmail', response.data.email || ''); // Ensure email is saved, default to empty string if null/undefined
        await AsyncStorage.setItem('userRole', response.data.role || 'user'); // Save role for future checks, default to 'user'

        Alert.alert(t('success'), t('loggedIn'));

        // Navigate to the appropriate Home screen based on the user's role
        // Pass userId, role, and userName via route params for immediate use on the next screen
        // This also ensures the DrawerRoutesWrapper can correctly pick the right drawer.
        if (response.data.role === 'admin') {
          navigation.replace('Home', {
            userId: response.data._id,
            role: 'admin',
            userName: userName,
          });
        } else {
          navigation.replace('Home', {
            userId: response.data._id,
            role: 'user',
            userName: userName,
          });
        }
      } else {
        // If response.data is empty or _id is missing, it's an invalid credential scenario
        Alert.alert(t('loginFailed'), t('invalidCredentials'));
      }
    } catch (error: any) {
      // Handle API request errors (e.g., network issues, server errors)
      console.error('Login error:', error.response?.data || error.message);
      Alert.alert(
        t('loginFailed'),
        error.response?.data?.message || t('invalidCredentials') // Display backend error message if available
      );
    } finally {
      setLoading(false); // Stop loading regardless of success or failure
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('login')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('phoneNumber')}
        value={emailOrPhone}
        onChangeText={setEmailOrPhone}
        keyboardType="email-address" // Use 'email-address' or 'phone-pad' as appropriate
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder={t('password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.loginButton, loading && styles.disabledButton]} // Apply disabled style when loading
        onPress={handleLogin}
        disabled={loading} // Disable button while loading
      >
        {loading ? (
          <ActivityIndicator color="#fff" /> // Show spinner when loading
        ) : (
          <Text style={styles.buttonText}>{t('login')}</Text>
        )}
      </TouchableOpacity>

      {/* Optional: Forgot password and Signup links */}
      <TouchableOpacity onPress={() => navigation.navigate('Signup1')}>
        <Text style={styles.signupText}>
          {t('notAUser')} <Text style={styles.signupLink}>{t('signup')}</Text>
        </Text>
      </TouchableOpacity>
      {/* You can add a forgot password link here if you have that functionality */}
      {/* <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.signupText}>{t('forgotPassword')}</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5F8FA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
  },
  signupLink: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  disabledButton: { // Style for disabled state
    opacity: 0.6,
  },
});

export default LoginScreen;
