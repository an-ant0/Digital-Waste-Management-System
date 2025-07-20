import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type AdminLoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AdminLogin'
>;

const AdminLoginScreen: React.FC = () => {
  const navigation = useNavigation<AdminLoginScreenNavigationProp>();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onUsernameChange = (text: string) => {
    setUsername(text);
    if (error) setError('');
  };

  const onPasswordChange = (text: string) => {
    setPassword(text);
    if (error) setError('');
  };

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    if (username === '1' && password === '1') {
      Alert.alert('Login Success', 'Welcome, Admin!');
      setError('');
      navigation.navigate('Home', { role: 'admin' });
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F4F6F8' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.heading}>Admin Login</Text>

          <TextInput
            placeholder="Username"
            style={styles.input}
            value={username}
            onChangeText={onUsernameChange}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
            returnKeyType="next"
            onSubmitEditing={() => {
              // Focus password input if you want (requires ref)
            }}
          />

          <TextInput
            placeholder="Password"
            style={styles.input}
            value={password}
            onChangeText={onPasswordChange}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default AdminLoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  error: {
    color: '#dc3545',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
  },
});
