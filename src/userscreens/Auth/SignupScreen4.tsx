import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup4'>;

const SignupScreen4: React.FC<Props> = ({ navigation, route }) => {
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!agree) {
      Alert.alert('Please Accept Terms', 'You must accept the terms and conditions to continue.');
      return;
    }

    setLoading(true);

    const allSignupData = route.params;

    try {
      const API_URL = 'http://192.168.1.76:5000/api/users/register';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allSignupData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Signup Successful', data.message || 'Account created successfully!');
        navigation.navigate('UserLogin');
      } else {
        Alert.alert('Signup Failed', data.message || 'Something went wrong. Please try again.');
        console.error('Backend Error:', data);
      }
    } catch (error) {
      console.error('Network or other error during signup:', error);
      Alert.alert('Error', 'Could not connect to the server. Please check your internet connection or server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Terms and Conditions</Text>

      <View style={styles.termsBox}>
        <Text style={styles.termsText}>
          By signing up to the DWMS app, you agree to the collection and use of your data in accordance
          with our privacy policy. Your identity details will only be used for verification purposes.
        </Text>
        <Text style={styles.termsText}>
          You also agree not to misuse the app and to report waste responsibly.
        </Text>
      </View>

      <View style={styles.checkboxContainer}>
        <CheckBox
          value={agree}
          onValueChange={setAgree}
          tintColors={{ true: '#007BFF', false: '#aaa' }}
        />
        <Text style={styles.checkboxLabel}>I agree to the terms and conditions</Text>
      </View>

      <TouchableOpacity
        style={[styles.signupButton, { opacity: agree && !loading ? 1 : 0.6 }]}
        disabled={!agree || loading}
        onPress={handleSignup}
      >
        <Text style={styles.signupButtonText}>
          {loading ? 'Signing Up...' : 'Signup'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SignupScreen4;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F9F9F9',
    flexGrow: 1,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  termsBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  signupButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
