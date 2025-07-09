import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup3'>;

const SignupScreen3: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNext = () => {
    if (!phone || !email || !otp || !password || !confirmPassword) {
      Alert.alert(t('missingFieldsTitle'), t('missingFieldsMessage'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('passwordMismatchTitle'), t('passwordMismatchMessage'));
      return;
    }

    const allData = {
      ...route.params,
      phone,
      email,
      otp,
      password,
    };

    navigation.navigate('Signup4', allData);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{t('signupStep3')}</Text>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>{t('contactInfo')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('phoneNumber')}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.input}
          placeholder={t('email')}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>{t('otpVerification')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('enterOtp')}
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
        />
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>{t('createPassword')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('enterPassword')}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder={t('confirmPassword')}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>{t('next')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SignupScreen3;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#F9F9F9',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  sectionBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: '#555',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  nextButton: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
