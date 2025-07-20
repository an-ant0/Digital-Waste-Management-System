import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'UserLogin'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmailOrPhone = emailOrPhone.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmailOrPhone || !trimmedPassword) {
      Alert.alert('Error', 'Please enter both email/phone and password.');
      return;
    }

    setLoading(true);

    try {
      const API_URL = 'http://192.168.1.130:5000/api/users/login';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrPhone: trimmedEmailOrPhone,
          password: trimmedPassword,
        }),
      });

      const data = await response.json();
      console.log('Login response data:', data);

      if (response.ok && data._id && data.firstName) {
        Alert.alert('Login Successful', data.message || 'Welcome back!');
        navigation.replace('Home', {
          userId: data._id,
          role: 'user',
          userName: `${data.firstName} ${data.lastName ?? ''}`.trim(),
        });
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert(
        'Network Error',
        'Unable to connect. Please check your server or internet connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Existing user?</Text>

        <TextInput
          style={styles.input}
          placeholder="Phone Number or Email"
          keyboardType="default"
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.loginButton, { opacity: loading ? 0.6 : 1 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Logging In...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.signupPrompt}>Not a user?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup1')}>
          <Text style={styles.signupText}>Signup</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signupPrompt: {
    marginTop: 30,
    fontSize: 16,
    color: '#666',
  },
  signupText: {
    marginTop: 8,
    fontSize: 18,
    color: '#007BFF',
    fontWeight: '600',
  },
});
