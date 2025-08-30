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
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../../config';

import { RootStackParamList } from '../../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'UserLogin'>;


const LoginScreen: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { t } = useTranslation();

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      Alert.alert(t('error'), t('enterBothFields'));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/users/login`, {
        emailOrPhone,
        password,
      });

      if (response.data && response.data._id) {
        await AsyncStorage.setItem('userId', response.data._id);
        const userName = `${response.data.firstName || ''} ${response.data.middleName ? response.data.middleName + ' ' : ''}${response.data.lastName || ''}`.trim();
        await AsyncStorage.setItem('userName', userName);
        await AsyncStorage.setItem('userPhone', response.data.phone || '');
        await AsyncStorage.setItem('userEmail', response.data.email || '');
        await AsyncStorage.setItem('userRole', response.data.role || 'user');

        Alert.alert(t('success'), t('loggedIn'));

        navigation.replace('UserDashboard', {
            userId: response.data._id,
            role: response.data.role,
            userName: userName,
        });

      } else {
        Alert.alert(t('loginFailed'), t('invalidCredentials'));
      }
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      Alert.alert(
        t('loginFailed'),
        error.response?.data?.message || t('invalidCredentials')
      );
    } finally {
      setLoading(false);
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
        keyboardType="email-address"
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
        style={[styles.loginButton, loading && styles.disabledButton]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('login')}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup1')}>
        <Text style={styles.signupText}>
          {t('notAUser')} <Text style={styles.signupLink}>{t('signup')}</Text>
        </Text>
      </TouchableOpacity>
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
    justifyContent: 'center',
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
  disabledButton: {
    opacity: 0.6,
  },
});

export default LoginScreen;