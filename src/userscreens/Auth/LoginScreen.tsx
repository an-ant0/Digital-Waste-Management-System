import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<RootStackParamList, 'UserLogin'>;

const UserLoginScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!phone || !password) {
      Alert.alert(t('error'), t('enterBothFields'));
      return;
    }

    if (phone === '1' && password === '1') {
      Alert.alert(t('success'), t('loggedIn'));
        navigation.navigate('Home', { role: 'user' });
    } else {
      Alert.alert(t('loginFailed'), t('invalidCredentials'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('existingUser')}</Text>

      <TextInput
        style={styles.input}
        placeholder={t('phoneNumber')}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        style={styles.input}
        placeholder={t('password')}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>{t('login')}</Text>
      </TouchableOpacity>

      <Text style={styles.signupPrompt}>{t('notAUser')}</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Signup1')}>
        <Text style={styles.signupText}>{t('signup')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserLoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
