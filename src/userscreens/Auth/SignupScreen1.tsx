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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../navigation/types'; 

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup1'>;

const SignupScreen1: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [homeNumber, setHomeNumber] = useState('');
  const [wardNumber, setWardNumber] = useState('');
  const [localityName, setLocalityName] = useState('');

  const handleNext = () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !homeNumber.trim() ||
      !wardNumber.trim() ||
      !localityName.trim()
    ) {
      Alert.alert(t('missingInfoTitle'), t('missingInfoMessage'));
      return;
    }

    navigation.navigate('Signup2', {
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      homeNumber: homeNumber.trim(),
      wardNumber: wardNumber.trim(),
      localityName: localityName.trim(),
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>{t('signupStep1')}</Text>

        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>{t('name')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('firstName') + ' *'}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder={t('middleName')}
            value={middleName}
            onChangeText={setMiddleName}
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            placeholder={t('lastName') + ' *'}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>{t('address')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('homeNumber') + ' *'}
            keyboardType="number-pad"
            value={homeNumber}
            onChangeText={setHomeNumber}
          />
          <TextInput
            style={styles.input}
            placeholder={t('wardNumber') + ' *'}
            keyboardType="number-pad"
            value={wardNumber}
            onChangeText={setWardNumber}
          />
          <TextInput
            style={styles.input}
            placeholder={t('localityName') + ' *'}
            autoCapitalize="words"
            value={localityName}
            onChangeText={setLocalityName}
          />
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>{t('next')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen1;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#F9F9F9',
    flexGrow: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: '#555',
    fontWeight: '600',
  },
  sectionBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
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
